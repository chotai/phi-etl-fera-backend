import { createLogger } from '~/src/helpers/logging/logger'
import { config } from '~/src/config'
import { MongoClient } from 'mongodb'
import { search } from '../index'

const logger = createLogger()

async function connectToMongo(collectionName)
{

  // initate mongodb connection to query it
  logger.info(`Initiate mongodb connection for: ${collectionName}`)
  const mongoUri = config.get('mongoUri')
  const databaseName = config.get('mongoDatabase')
  const client = new MongoClient(mongoUri.toString(), {})

    // Connect to MongoDB
    try {
      await client.connect()
      const db = client.db(databaseName)
      logger.info(`Connected to mongodb, fetching : ${collectionName}`)
  
      const collection = await db.collection(collectionName)
      return collection
    } catch (error) {
      logger.info(`Collection could not be fetched ${error}`)
      // TODO: Acutal message to be picked from the resource file
      return error.message
    }
}
async function searchPlantDetailsDb(searchInput) {
  const searchText = searchInput
  let results = []

  try {

    const query = {}
    // TODO: Collection name to be read from config file
    const collectionPlant = await connectToMongo('PLANT_DETAIL')
  
    // TODO: Query will evolve, it'll have to be fine tuned based on the collection
    // strucutre to support all the business use cases
    if (searchInput !== '') {
      query.LatinName = { $regex: new RegExp(searchText, 'i') }
      const latinNameResults = await collectionPlant.find(query).toArray()

      // The structure of the results will be the same for each match, the frontend will
      // use the fields that it needs, and ignore the rest
      // If optimisation is required, the result-set will be fine tuned. 
      if (latinNameResults){ 
        results.push({id:'latin-name', results:latinNameResults})
       }

      query.COMMON_NAME = { $regex: new RegExp(searchText, 'i') }
      const commonNameResults = await collectionPlant.find({'COMMON_NAME.NAME': query.COMMON_NAME }).toArray()
      
      if (commonNameResults){ 
        results.push({id:'common-name', results:commonNameResults})
      }
 
       query.SYNONYM_NAME = { $regex: new RegExp(searchText, 'i') }
       const synonymResults = await collectionPlant.find({'SYNONYM_NAME.NAME': query.SYNONYM_NAME }).toArray()
       if (synonymResults){ 
        results.push({id:'synonym-name', results:synonymResults})
       }
    }
    return results

  } catch (error) {
    logger.info(`Search query failed ${error}`)
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}

async function getCountries() {
  try {
    const collectionCountries = await connectToMongo('COUNTRIES')
    const results = await collectionCountries.find({}).toArray()
    return results
  } catch (error) {
    logger.info(`Countries could not be fetched ${error}`)
    // TODO: Acutal message to be picked from the resource file
    return error.message
  }
}

module.exports = { searchPlantDetailsDb, getCountries}
