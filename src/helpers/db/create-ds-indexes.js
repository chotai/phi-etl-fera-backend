import { Client } from '@opensearch-project/opensearch'
import { createLogger } from '~/src/helpers/logging/logger'
import { config } from '~/src/config'

const logger = createLogger()

// create index on the mongodb collections, if exists
async function createMongoDBIndexes(db) {
  logger.info('inside createMongoDBIndexes')

  const collections = await db.listCollections().toArray()
  try {
    collections?.forEach(async (collectionInfo) => {
      logger.info('collection:', collectionInfo.name)

      // Gheck for Plant_Detail collection
      if (collectionInfo.name === 'PLANT_DETAIL') {
        logger.info('collectionName:', collectionInfo.name)

        // Get the collection reference
        const collection = db.collection(collectionInfo.name)

        // Create an index on the specified field
        await collection.createIndex({ LATIN_NAME: 1 })

        logger.info('Index created on LATIN_NAME')

        indexDataFromMongoDB(db)
      }
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    logger.error('erroring:createMongoDBIndexes....', error)
  }
}

// create opensearch indexes from mongodb collection
async function indexDataFromMongoDB(db) {
  try {
    // Initialise OpenSearch Client
    const osClient = new Client({ node: config.get('openSearchUri') })
    const collections = await db.listCollections().toArray()

    for (const collectionObj of collections) {
      logger.info('THE OS COLLECTION:', collectionObj.name)

      if (collectionObj.name === 'PLANT_DETAIL') {
        const collection = db.collection(collectionObj.name)
        const cursor = collection.find({})

        const isConnected = await testConnection(osClient)

        if (isConnected) {
          while (await cursor.hasNext()) {
            const doc = await cursor.next()
            logger.info(doc)

            await osClient.index({
              index: collectionObj.name.toLowerCase(), // creating an index for each collection
              body: doc
            })
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error creating OS Indexes from MongoDB collections:', error)
  }
}
async function testConnection(osClient) {
  try {
    const response = await osClient.info()
    logger.info(response)
    return true
  } catch (error) {
    logger.error('Connection failed:', error)
    return false
  }
}

export { createMongoDBIndexes, indexDataFromMongoDB }
