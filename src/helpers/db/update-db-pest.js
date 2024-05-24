import { createLogger } from '~/src/helpers/logging/logger'
import { config } from '~/src/config'
import { pestDetail } from '../models/pestDetail'

import { MongoClient } from 'mongodb'
const logger = createLogger()

const mongoUri = config.get('mongoUri') // Get MongoDB URI from the config
const dbName = config.get('mongoDatabase') // Get MongoDB database name from the config
const collectionName = 'PEST_DETAIL'

// Populate the DB in this template on startup of the API.
// This is an example to show developers an API with a DB, with data in it and endpoints that query the db.
const updateDbPest = {
  plugin: {
    name: 'Update Pest DB',
    register: async (server) => {
      try {
        await loadData(mongoUri, dbName, collectionName, 1)
      } catch (error) {
        logger.error(error)
      }
    }
  }
}
async function loadData(mongoUri, dbName, collectionName, indicator) {
  const client = new MongoClient(mongoUri)
  try {
    // Connect the client to the server
    await client.connect()
    logger.info('Connected successfully to server')

    // Select the database
    const db = client.db(dbName)

    // Select the collection
    const collection = db.collection('PEST_NAME')
    // Find all documents in the collection
    const documents = await collection.find({}).toArray()
    // Read Plants
    const pestList = documents[0]?.PEST_NAME

    const collectionName = 'PEST_DATA'
    const collectionPest = db.collection(collectionName)

    logger.info(`pestList: ${pestList?.length}`)

    // Select and Find all Plants Pest Link
    const plantPestLinkList = await db
      .collection('PLANT_PEST_LINK')
      .find({})
      .toArray()

    // Drop the collection if it exists
    const collections = await db
      .listCollections({ name: collectionName })
      .toArray()
    if (collections.length > 0) {
      await collectionPest.drop()
      logger.info(`Collection ${collectionName} dropped.`)
    }
    const collectionNew = db.collection('PEST_DATA')

    const resultList = pestList.map((pest) => {
      const psDetail = pestDetail.get('pestDetail')
      psDetail.EPPO_CODE = pest?.EPPO_CODE
      psDetail.CSL_REF = pest?.CSL_REF
      psDetail.LATIN_NAME = pest?.LATIN_NAME

      const cnameList = pest?.COMMON_NAME?.COMMON_NAME?.map(
        (name) => name
      ).filter((x) => x !== '')
      const snameList = pest?.SYNONYM_NAME?.SYNONYM_NAME?.map(
        (name) => name
      ).filter((x) => x !== '')
      psDetail.PLANT_NAME = [
        { type: 'LATIN_NAME', NAME: pest?.LATIN_NAME },
        { type: 'COMMON_NAME', NAME: cnameList },
        { type: 'SYNONYM_NAME', NAME: snameList }
      ]

      return psDetail
    })
    logger.info(`pest resultList: ${resultList?.length}`)

    // update ResultList with PLANT_PEST_LINK
    const pestLinkResultList = resultList.map((pest) => {
      const pplList = plantPestLinkList
        .filter((cListItem) => cListItem.CSL_REF === pest.CSL_REF)
        .map((cListItem) => ({
          PLANT_NAME: {
            TYPE: 'string',
            NAME: 'string'
          },
          HOST_REF: cListItem?.HOST_REF,
          EPPO_CODE: pest?.EPPO_CODE,
          HOST_CLASS: cListItem?.HOST_CLASS,
          LATIN_NAME: pest?.LATIN_NAME,
          PARENT_HOST_REF: 'string'
        }))

      return {
        CSL_REF: pest.CSL_REF,
        PLANT_LINK: pplList
      }
    })

    resultList.forEach((x) => {
      pestLinkResultList?.forEach((pest) => {
        if (x?.CSL_REF === pest?.CSL_REF) {
          x.PLANT_LINK = pest?.PLANT_LINK
        }
      })
    })
    // Main resultList
    const result = await collectionNew.insertMany(resultList)

    logger.info(`${result.insertedCount} pest documents were inserted...`)
  } catch (err) {
    logger.error(err)
  } finally {
    // Close the connection
    await client.close()
  }
}
export { updateDbPest }
