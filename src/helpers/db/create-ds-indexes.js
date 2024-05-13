import { Client } from '@opensearch-project/opensearch'
import { config } from '~/src/config'

// create index on the mongodb collections, if exists
async function createMongoDBIndexes(db) {
  console.info('inside createMongoDBIndexes')

  const collections = await db.listCollections().toArray()
  try {
    collections?.forEach((collection) => {
      console.log('collection:', collection?.name)
      if (collection?.name === 'PLANT_DETAIL') {
        console.log('collectionName:', collection?.name)
        // db.collection(collection?.name).createIndexes([{ LATIN_NAME: 1 }])
      }
    })
  } catch (error) {
    console.error('erroring:createMongoDBIndexes....', error);
  }
  //indexDataFromMongoDB(db)
}

// create opensearch indexes from mongodb collection
async function indexDataFromMongoDB(db) {
  try {
    // Initialise OpenSearch Client
    const osClient = new Client({ node: config.get('openSearchUri') })

    const collections = await db.listCollections().toArray()

    for (const collectionName of collections) {
      console.log('collectionName:', collectionName)
      const collection = db.collection(collectionName)
      const cursor = collection.find({})
      console.log('cursor:', cursor)
      while (await cursor.hasNext()) {
        console.log('cursor::', cursor?.hasNext())
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
