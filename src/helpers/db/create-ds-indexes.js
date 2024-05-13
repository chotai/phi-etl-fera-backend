import { Client } from '@opensearch-project/opensearch'
import { config } from '~/src/config'

// create index on the mongodb collections, if exists
async function createMongoDBIndexes(db) {
  console.info('inside createMongoDBIndexes')

  const collections = await db.listCollections().toArray()
  try {
    collections?.forEach(async (collectionInfo) => {
      console.log('collection:', collectionInfo.name)

      // Gheck for Plant_Detail collection
      if (collectionInfo.name === 'PLANT_DETAIL') {
        console.log('collectionName:', collectionInfo.name)

        // Get the collection reference
        const collection = db.collection(collectionInfo.name)

        // Create an index on the specified field
        await collection.createIndex({ LATIN_NAME: 1 })

        console.log('Index created on LATIN_NAME')

        indexDataFromMongoDB(db)
      }
    })
  } catch (error) {
    console.error('erroring:createMongoDBIndexes....', error)
  }
}

// create opensearch indexes from mongodb collection
async function indexDataFromMongoDB(db) {
  try {
    // Initialise OpenSearch Client
    const osClient = new Client({ node: config.get('openSearchUri') })
    const collections = await db.listCollections().toArray()

    for (const collectionObj of collections) {
      console.log('THE OS COLLECTION:', collectionObj.name)

      if (collectionObj.name === 'PLANT_DETAIL') {
        const collection = db.collection(collectionObj.name)
        const cursor = collection.find({})

        const isConnected = await testConnection(osClient)

        if (isConnected){
          while (await cursor.hasNext()) {
            //console.log('cursor hasnext', cursor.hasNext())
            const doc = await cursor.next()
            console.log(doc)
            
            await osClient.index({
              index: collectionObj.name.toLowerCase(), // creating an index for each collection
              body: doc
            })}
        }
      }
    }
  } catch (error) {
    console.error('Error creating OS Indexes from MongoDB collections:', error)
  }
}
async function testConnection(osClient) {
  try {
    const response = await osClient.info()
    console.log(response)
    return true
  } catch (error) {
    console.error('Connection failed:', error)
    return false
  }
}

export { createMongoDBIndexes, indexDataFromMongoDB }
