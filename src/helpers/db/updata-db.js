import { createLogger } from '~/src/helpers/logging/logger'
import path from 'path'
import { config } from '~/src/config'
import { MongoClient } from 'mongodb'
const logger = createLogger()
const filePathPlant = path.join(__dirname, 'data', 'plants.json')

const mongoUri = config.get('mongoUri') // Get MongoDB URI from the config
const dbName = config.get('mongoDatabase') // Get MongoDB database name from the config

const collectionNamePlant = 'PLANT_DETAIL'
const collectionNamePlantName = 'PLANT_NAME'

// Populate the DB in this template on startup of the API.
// This is an example to show developers an API with a DB, with data in it and endpoints that query the db.
const updateDb = {
  plugin: {
    name: 'Update DB',
    register: async (server) => {
      try {
        await loadData(filePathPlant, mongoUri, dbName, collectionNamePlant, 1)
      } catch (error) {
        logger.error(error)
      }
    }
  }
}
async function loadData(filePath, mongoUri, dbName, collectionName, indicator) {
  const client = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  try {
    // Connect the client to the server
    await client.connect()
    logger.info('Connected successfully to server')

    // Select the database
    const db = client.db(dbName)

    // Select the collection
    const collection = db.collection('PLANT_NAME')
    // Find all documents in the collection
    const documents = await collection.find({}).toArray()
    // Read Plants
    const plantList = documents[0]?.PLANT_NAME

    const collectionName = 'PLANT_DETAIL_NEW'
    const collectionPlant = db.collection(collectionName)

    // Select the Annex
    const collectionAnnex11 = db.collection('PLANT_ANNEX11')
    const collectionAnnex6 = db.collection('PLANT_ANNEX6')

    // Find all the Annex documents

    const collectionAnnex11Documents = await collectionAnnex11
      .find({})
      .toArray()
    const collectionAnnex6Documents = await collectionAnnex6.find({}).toArray()

    // Read Annex 11 and 6
    const annex11List = collectionAnnex11Documents[0]?.PLANT_ANNEX11
    const annex6List = collectionAnnex6Documents[0]?.PLANT_ANNEX6

    // Select and Find all Plants Pest Link
    const collectionPlantPestLink = await db
      .collection('PLANT_PEST_LINK')
      .find({})
      .toArray()
    // Read all Plants Pest Link
    const plantPestLinkList = collectionPlantPestLink[0]?.PLANT_PEST_LINK

    const collectionPlantPestReg = await db
      .collection('PLANT_PEST_REG')
      .find({})
      .toArray()
    const plantPestRegList = collectionPlantPestReg[0]?.PLANT_PEST_REG

    // Read Pest names
    const collectionPestNames = await db
      .collection('PEST_NAME')
      .find({})
      .toArray()
    const pestNamesList = collectionPestNames[0]?.PEST_NAME

    console.log('Annex11:', annex11List?.length)
    console.log('Annex6:', annex6List?.length)
    console.log('plantList:', plantList?.length)
    console.log('plantPestLinkList:', plantPestLinkList?.length)
    console.log('plantPestRegList:', plantPestRegList?.length)
    console.log('pestNamesList:', pestNamesList?.length)
    // Drop the collection if it exists
    const collections = await db
      .listCollections({ name: collectionName })
      .toArray()
    if (collections.length > 0) {
      await collectionPlant.drop()
      logger.info(`Collection ${collectionName} dropped.`)
    }
    // eslint-disable-next-line camelcase
    const collectionNew = db.collection('PLANT_DETAIL_NEW')

    const resultList = plantList.map((plant) => {
      const plDetail = {
        EPPO_CODE: 'string',
        GENUS_NAME: 'plant',
        HOST_REF: 'string',
        HOST_REGULATION: {
          ANNEX11: {
            A11_RULE: 'string',
            BTOM: 'string',
            BTOM_CLARIFICATION: 'string',
            BTOM_NON_EUSL: 'string',
            COUNTRY_CODE: 'string',
            COUNTRY_NAME: 'string',
            IMPORT_RULE: 'string',
            IMPORT_RULE_NON_EUSL: 'string',
            INFERRED: 'string',
            SERVICE_FORMAT: 'string',
            SERVICE_SUB_FORMAT: 'string',
            SERVICE_SUB_FORMAT_EXCLUDED: 'string'
          },
          ANNEX6: {
            A6_RULE: 'string',
            COUNTRY_CODE: 'string',
            COUNTRY_NAME: 'string',
            FORMAT_CLARIFICATION: 'string',
            FORMAT_EXCLUDED: {
              FORMAT_ID: 'string',
              FORMAT_NAME: 'string'
            },
            HYBRID_INDICATOR: 'string',
            OVERALL_DECISION: 'string',
            PROHIBITION_CLARIFICATION: 'string',
            SERVICE_FORMAT: 'string'
          }
        },
        LATIN_NAME: 'string',
        PARENT_HOST_REF: 'string',
        PEST_LINK: {
          PEST_NAME: {
            TYPE: 'string',
            NAME: 'string'
          },
          CSL_REF: 'string',
          EPPO_CODE: 'string',
          FORMAT: {
            FORMAT: 'string',
            FORMAT_ID: 'string'
          },
          HOST_CLASS: 'string',
          LATIN_NAME: 'string',
          PARENT_CSL_REF: 'string',
          PEST_COUNTRY: [
            {
              COUNTRY_CODE: 'string',
              COUNTRY_NAME: 'string',
              COUNTRY_STATUS: 'string'
            }
          ],
          REGULATION_CATEGORY: 'string'
        },
        PLANT_NAME: [
          {
            NAME: 'string',
            TYPE: 'string'
          },
          {
            NAME: 'string',
            NAME_TYPE: 'string'
          }
        ],
        SPECIES_NAME: 'string',
        TAXONOMY: 'string'
      }
      // const plDetail = plantDetail
      plDetail.EPPO_CODE = plant?.EPPO_CODE
      plDetail.HOST_REF = plant?.HOST_REF
      plDetail.TAXONOMY = plant?.TAXONOMY

      const cnameList = plant?.COMMON_NAME?.NAME.map((name) => name).filter(
        (x) => x !== ''
      )
      const snameList = plant?.SYNONYM_NAME?.NAME.map((name) => name).filter(
        (x) => x !== ''
      )
      plDetail.PLANT_NAME = [
        { type: 'LATIN_NAME', NAME: plant?.LATIN_NAME },
        { type: 'COMMON_NAME', NAME: cnameList },
        { type: 'SYNONYM_NAME', NAME: snameList }
      ]
      return plDetail
    })
    console.log('resultList:', resultList?.length)

    // ANNEX6 mapping
    const myList = annex6List.filter((n6) => n6.HOST_REF === 28)
    const myList11 = annex11List.filter((n11) => +n11.HOST_REF === 380)
    // console.log('myListNx11:', myList11)
    // console.log('myListNx6:', myList)

    const annex6ResultList = resultList.map((nx6) => {
      const nx6List = annex6List.filter((n6) => n6.HOST_REF === nx6.HOST_REF)
      if (nx6List?.length !== 0) {
        // console.log('nx6List:', nx6List.length)
      }
      return { HOST_REF: nx6.HOST_REF, ANNEX6: nx6List }
    })
    // console.log('annex6ResultList:', annex6ResultList)

    // ANNEX11 mapping

    const annex11ResultList = resultList.map((nx11) => {
      const nx11List = annex11List.filter(
        (n11) => +n11.HOST_REF === +nx11.HOST_REF
      )
      return { HOST_REF: nx11.HOST_REF, ANNEX11: nx11List }
    })

    // update ResultList with ANNEX6 information
    resultList.forEach((x) => {
      annex6ResultList.forEach((nx6) => {
        if (x.HOST_REF === nx6.HOST_REF) {
          x.HOST_REGULATION.ANNEX6 = nx6.ANNEX6
        }
      })
    })

    // update ResultList with ANNEX11 information
    resultList.forEach((x) => {
      annex11ResultList.forEach((nx11) => {
        if (x.HOST_REF === nx11.HOST_REF) {
          x.HOST_REGULATION.ANNEX11 = nx11.ANNEX11
        }
      })
    })

    // update ResultList with PLANT_PEST_LINK
    resultList.forEach((x) => {
      plantPestLinkList?.forEach((pest) => {
        if (x?.HOST_REF === pest?.HOST_REF) {
          x.PEST_LINK.CSL_REF = pest?.CSL_REF
          x.PEST_LINK.HOST_CLASS = pest?.HOST_CLASS
        }
      })
    })

    // update ResultList with PEST_NAME
    resultList.forEach((x) => {
      pestNamesList?.forEach((pest) => {
        if (x?.PEST_LINK.CSL_REF === pest?.CSL_REF) {
          // populate Pest Names
          const cnameList = pest?.COMMON_NAME?.COMMON_NAME.map(
            (name) => name
          ).filter((x) => x !== '')
          const snameList = pest?.SYNONYM_NAME?.SYNONYM_NAME.map(
            (name) => name
          ).filter((x) => x !== '')
          x.PEST_LINK.PEST_NAME = [
            { type: 'LATIN_NAME', NAME: pest?.LATIN_NAME },
            { type: 'COMMON_NAME', NAME: cnameList },
            { type: 'SYNONYM_NAME', NAME: snameList }
          ]
          x.PEST_LINK.EPPO_CODE = pest.EPPO_CODE
        }
      })
    })
    // Main resultList
    const result = await collectionNew.insertMany(resultList)

    logger.info(`${result.insertedCount} documents were inserted`)
  } catch (err) {
    logger.error(err)
  } finally {
    // Close the connection
    await client.close()
  }
}
export { updateDb }
