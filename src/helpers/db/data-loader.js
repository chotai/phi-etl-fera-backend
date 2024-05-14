import { MongoClient } from 'mongodb'
import fs from 'fs/promises'

export async function loadDataFromJson(
  filePath,
  mongoUri,
  dbName,
  collectionName
) {
  const fileContents = await fs.readFile(filePath, 'utf-8')
  const jsonData = JSON.parse(fileContents)

  const client = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    await collection.insertMany(jsonData)
    console.log('Data successfully loaded into MongoDB')
  } catch (error) {
    console.error('Failed to load data into MongoDB:', error)
  } finally {
    await client.close()
  }
}
