import { MongoClient } from 'mongodb'
import { config } from '~/src/config'

const mongoPlugin = {
  name: 'mongodb',
  version: '1.0.0',
  register: async function (server) {
    const db = createMongoClient(server.secureContext, server.logger)
    server.decorate('server', 'db', db)
    server.decorate('request', 'db', db)
  }
}

async function createMongoClient(secureContext, logger) {
  const mongoOptions = {
    retryWrites: false,
    readPreference: 'secondary',
    ...(secureContext && { secureContext })
  }
  // connect to mongodb and add to server context
  const mongoUrl = config.get('mongoUri')
  const databaseName = config.get('mongoDatabase')
  logger.info('Setting up mongodb')
  const client = await MongoClient.connect(mongoUrl.toString(), mongoOptions)
  const db = client.db(databaseName)
  logger.info(`mongodb connected to ${databaseName}`)
  return db
}

export { createMongoClient, mongoPlugin }
