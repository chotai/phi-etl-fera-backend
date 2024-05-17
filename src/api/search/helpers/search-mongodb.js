import { createLogger } from '~/src/helpers/logging/logger'
import { config } from '~/src/config'
import { MongoClient } from 'mongodb'

const logger = createLogger()

async function searchPlantDetailsDb(searchParams) {
  // initate mongodb connection to query it
  logger.info('Initiate mongodb connection for search ')
  const { latinName = '', commonName = '', synonymName = '' } = searchParams

  const mongoUri = config.get('mongoUri')
  const databaseName = config.get('mongoDatabase')
  const client = new MongoClient(mongoUri.toString(), {})

  // Connect to MongoDB
  try {
    await client.connect()
    const query = {}

    // TODO: Query will evolve, it'll have to be fine tuned based on the collection
    // strucutre to support all the business use cases
    if (latinName !== '') {
      query.LatinName = { $regex: new RegExp(latinName, 'i') }
    }
    if (commonName !== '') {
      query.Common_Name = { $regex: new RegExp(commonName, 'i') }
    }
    if (synonymName !== '') {
      query.Synonym_Name = { $regex: new RegExp(synonymName, 'i') }
    }

    const db = client.db(databaseName)
    logger.info('Connected to mongodb, plant search commencing')

    const collectionPlant = await db.collection('PLANT_DETAIL')
    const results = await collectionPlant.find(query).toArray()
    return results
  } catch (error) {
    logger.info('Search query failed', error)
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}

module.exports = { searchPlantDetailsDb }
