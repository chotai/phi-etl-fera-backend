import { createLogger } from '~/src/helpers/logging/logger'
import { populateApi } from '~/src/helpers/db/populate-api'
import path from 'path'
import { config } from '~/src/config'
import { loadDataFromJson } from './data-loader'

const logger = createLogger()
const filePathPlant = path.join(__dirname, 'data', 'plants.json')
const filePathCountry = path.join(__dirname, 'data', 'countries.json')
const filePathService = path.join(__dirname, 'data', 'serviceFormat.json')

const mongoUri = config.get('mongoUri') // Get MongoDB URI from the config
const dbName = config.get('mongoDatabase') // Get MongoDB database name from the config

const collectionNamePlant = 'PLANT_DETAIL' // Define the MongoDB collection name
const collectionNameCountry = 'COUNTRIES' // Define the MongoDB collection name
const collectionNameServiceFormat = 'SERVICE_FORMAT' // Define the MongoDB collection name

// Populate the DB in this template on startup of the API.
// This is an example to show developers an API with a DB, with data in it and endpoints that query the db.
const populateDb = {
  plugin: {
    name: 'Populate MongoDb',
    register: async (server) => {
      try {
        await loadDataFromJson(
          filePathPlant,
          mongoUri,
          dbName,
          collectionNamePlant,
          1
        )
        await loadDataFromJson(
          filePathService,
          mongoUri,
          dbName,
          collectionNameServiceFormat,
          1
        )
        await loadDataFromJson(
          filePathCountry,
          mongoUri,
          dbName,
          collectionNameCountry,
          1
        )

        await server.start()
        await populateApi(server.mongoClient, server.db)
      } catch (error) {
        logger.error(error)
      }
    }
  }
}

export { populateDb }
