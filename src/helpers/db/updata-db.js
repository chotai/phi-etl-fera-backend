import { createLogger } from '~/src/helpers/logging/logger'
import path from 'path'
import { config } from '~/src/config'
import { MongoClient } from 'mongodb'
import plantDetail from '../models/plantDetail'
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
    const plantList = documents[0]?.PLANT_NAME

    const collectionName = 'PLANT_DETAIL_NEW'
    const collectionPlant = db.collection(collectionName)

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
          COMMON_NAME: {
            NAME1: 'string',
            NAME2: 'string'
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
            NAME_TYPE: 'string'
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
      plDetail.LATIN_NAME = plant?.LATIN_NAME
      return plDetail
    })
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
