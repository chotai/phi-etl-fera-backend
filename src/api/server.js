import path from 'path'
import hapi from '@hapi/hapi'
import { loadDataFromJson } from '../helpers/db/data-loader'

import { config } from '~/src/config'
import { router } from '~/src/api/router'
import { requestLogger } from '~/src/helpers/logging/request-logger'
import { mongoPlugin } from '~/src/helpers/mongodb'
import { failAction } from '~/src/helpers/fail-action'
import { populateDb } from '~/src/helpers/db/populate-db'
import { secureContext } from '~/src/helpers/secure-context'

const isProduction = config.get('isProduction')

async function createServer() {
  const server = hapi.server({
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  await server.register(requestLogger)

  if (isProduction) {
    await server.register(secureContext)
  }

  await server.register({ plugin: mongoPlugin, options: {} })

  await server.register(router)

  await server.register(populateDb)

  /*****/
  // Define the path to the JSON file
  const filePathPlant = path.join(__dirname, 'data', 'plants.json')
  const filePathCountry = path.join(__dirname, 'data', 'countryGrouping.json')
  const filePathService = path.join(__dirname, 'data', 'serviceFormat.json')

  const mongoUri = config.get('mongoUri') // Get MongoDB URI from the config
  const dbName = config.get('mongoDatabase') // Get MongoDB database name from the config
  
  const collectionNamePlant = 'PLANT_DETAIL' // Define the MongoDB collection name
  const collectionNameCountry = 'COUNTRY_GROUPING' // Define the MongoDB collection name
  const collectionNameServiceFormat = 'SERVICE_FORMAT' // Define the MongoDB collection name

  try {
    // Load JSON data into MongoDB before starting the server
    await loadDataFromJson(filePathPlant, mongoUri, dbName, collectionNamePlant, 1)
    await loadDataFromJson(filePathService, mongoUri, dbName, collectionNameServiceFormat, 1)
    await loadDataFromJson(filePathCountry, mongoUri, dbName, collectionNameCountry, 1)


    await server.start()
    console.log(`Server running at ${server.info.uri}`)
  } catch (error) {
    console.error('Failed to start the server:', error)
  }

  /*****/
  return server
}

export { createServer }
