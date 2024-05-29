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
async function loadData(mongoUri, dbName) {
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

    const collectionPlant = db.collection('PLANT_NAME')
    const collectionPestPras = db.collection('PEST_PRA_DATA')
    const collectionPestFCPD = db.collection('PEST_DOCUMENT_FCPD')

    const plantList = await collectionPlant.find({}).toArray()
    const collectionPestPrasDocs = await collectionPestPras.find({}).toArray()
    const collectionPestFCPDDocs = await collectionPestFCPD.find({}).toArray()

    const pestPrasList = collectionPestPrasDocs[0]?.PEST_PRA_DATA
    const pestFcpdList = collectionPestFCPDDocs[0]?.PEST_DOCUMENT_FCPD

    logger.info(`pestPrasList: ${pestPrasList?.length}`)
    logger.info(`pestFcpdList: ${pestFcpdList?.length}`)

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
      psDetail.PEST_NAME = [
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
    // update DOCUMENT_LINK with PrasList
    const documentLinkResultList = resultList.map((pest) => {
      const documentLinkList = pestPrasList
        .filter((dListItem) => dListItem.CSL_REF === pest.CSL_REF)
        .map((dListItem) => ({
          DOCUMENT_TYPE: dListItem?.DOCUMENT_TYPE,
          DOCUMENT_TITLE: dListItem?.DOCUMENT_TITLE,
          DOCUMENT_HYPER_LINK: dListItem?.DOCUMENT_HYPER_LINK,
          VISIBLE_ON_PHI_INDICATOR: dListItem?.VISIBLE_ON_PHI_INDICATOR,
          PUBLICATION_DATE: dListItem?.PUBLICATION_DATE,
          DOCUMENT_SIZE: dListItem?.DOCUMENT_SIZE,
          NO_OF_PAGE: 'string',
          DOCUMENT_FORMAT: dListItem?.DOCUMENT_FORMAT,
          PARENT_CSL_REF: 'string'
        }))

      return {
        CSL_REF: pest.CSL_REF,
        DOCUMENT_LINK: documentLinkList
      }
    })

    const documentLinkFcpdResultList = resultList.map((pest) => {
      const documentLinkList = pestFcpdList
        .filter((dListItem) => dListItem.CSL_REF === pest.CSL_REF)
        .map((dListItem) => ({
          DOCUMENT_TYPE: dListItem?.DOCUMENT_TYPE,
          DOCUMENT_TITLE: dListItem?.DOCUMENT_TITLE,
          DOCUMENT_HYPER_LINK: dListItem?.DOCUMENT_HYPER_LINK,
          VISIBLE_ON_PHI_INDICATOR: dListItem?.VISIBLE_ON_PHI_INDICATOR,
          PUBLICATION_DATE: dListItem?.PUBLICATION_DATE,
          DOCUMENT_SIZE: dListItem?.DOCUMENT_SIZE,
          NO_OF_PAGE: 'string',
          DOCUMENT_FORMAT: dListItem?.DOCUMENT_FORMAT,
          PARENT_CSL_REF: 'string'
        }))

      return {
        CSL_REF: pest.CSL_REF,
        DOCUMENT_LINK: documentLinkList
      }
    })

    resultList.forEach((x) => {
      documentLinkResultList?.forEach((pest) => {
        if (x?.CSL_REF === pest?.CSL_REF) {
          x.DOCUMENT_LINK = pest?.DOCUMENT_LINK
        } else {
          x.DOCUMENT_LINK = []
        }
      })
    })

    resultList.forEach((x) => {
      documentLinkFcpdResultList?.forEach((pest) => {
        if (x?.CSL_REF === pest?.CSL_REF) {
          x.DOCUMENT_LINK.push(...pest?.DOCUMENT_LINK)
        }
      })
    })

    // update PEST Country with PEST_DISTRIBUTION
    const collectionPestDistribution = await db
      .collection('PEST_DISTRIBUTION')
      .find({})
      .toArray()

    const pestDistributionList =
      collectionPestDistribution[0]?.PEST_DISTRIBUTION

    const countryResultList = resultList.map((pest) => {
      const countries = pestDistributionList
        .filter((cListItem) => cListItem.CSL_REF === pest.CSL_REF)
        .map((cListItem) => ({
          COUNTRY_CODE: cListItem.COUNTRY_CODE,
          COUNTRY_NAME: cListItem.COUNTRY_NAME,
          COUNTRY_STATUS: cListItem.STATUS
        }))

      return {
        CSL_REF: pest.CSL_REF,
        COUNTRIES: countries
      }
    })

    resultList.forEach((pl) => {
      countryResultList.forEach((pest) => {
        if (pl?.CSL_REF === pest?.CSL_REF) {
          pl.PEST_COUNTRY_DISTRIBUTION = pest?.COUNTRIES
        }
      })
    })

    // update PLANT_LINK -> PLANT_NAME

    resultList.forEach((pest) => {
      pest?.PLANT_LINK?.forEach((pl) => {
        plantList.forEach((plant) => {
          if (pl.HOST_REF === plant.HOST_REF) {
            const cnameList = plant?.COMMON_NAME?.NAME.map(
              (name) => name
            ).filter((x) => x !== '')
            const snameList = plant?.SYNONYM_NAME?.NAME.map(
              (name) => name
            ).filter((x) => x !== '')

            pl.PLANT_NAME = [
              { type: 'LATIN_NAME', NAME: plant?.LATIN_NAME },
              { type: 'COMMON_NAME', NAME: cnameList },
              { type: 'SYNONYM_NAME', NAME: snameList }
            ]
          }
        })
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
