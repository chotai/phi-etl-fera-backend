import { Client } from '@opensearch-project/opensearch'
import { config } from '~/src/config'

//create index on the mongodb collections, if exists
async function createMongoDBIndexes(db) {
  console.info('inside createMongoDBIndexes')

  const collections = await db.listCollections().toArray()
  server.logger.info('fetching mongodb collections')

  collections?.forEach((collection) => {
    db.collection(collection?.name).createIndexes({ id: 1 })
  })
  indexDataFromMongoDB(db)
}

//create opensearch indexes from mongodb collection
async function indexDataFromMongoDB(db) {
  try {
    // Initialise OpenSearch Client
    const osClient = new Client({ node: config.get('openSearchUri') })
    const collections = await db.listCollections().toArray()

    for (let collectionName of collections) {
      const collection = db.collection(collectionName)
      const cursor = collection.find({})

      while (await cursor.hasNext()) {
        const doc = await cursor.next()
        await osClient.index({
          index: collectionName.toLowerCase(), // creating an index for each collection
          body: doc
        })
      }
    }
  } catch (error) {
    console.error('Error creating OS Indexes from MongoDB collections:', error)
  }
}

export { createMongoDBIndexes, indexDataFromMongoDB }
