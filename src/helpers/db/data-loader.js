import { MongoClient } from 'mongodb'
import fs from 'fs/promises'

export async function loadDataFromJson(
  filePath,
  mongoUri,
  dbName,
  collectionName,
  indicator
) {
  console.log('dbName:', dbName)
  console.log('filePath:', filePath)
  console.log('collection:', collectionName)
  const fileContents = await fs.readFile(filePath, 'utf-8')
  console.log('fileContents:', fileContents)
  const jsonData = JSON.parse(fileContents)

  const client = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  try {
    console.log('jsonData:', jsonData)
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    if (indicator === 1) {
        await collection.insertOne(jsonData)
    } else if ( indicator === 2) {
        await collection.insertMany(jsonData)
    }
    console.log('Data successfully loaded into MongoDB')
  } catch (error) {
    console.error('Failed to load data into MongoDB_MJ:', error)
  } finally {
    await client.close()
  }
}
