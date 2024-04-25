import { MongoClient } from 'mongodb'

async function createIndexes(db) {
  await db.collection('plants').createIndex({ plantId: 1 })
}

// object for integration of mongoPlugin to Hapi server
const mongoPlugin = {
  name: 'phiMongodbPlugin',
  version: '1.0.0',
  register: async function (server, options) {
    server.logger.info('Setting up mongodb')

  // options defined in config/index.js
    const client = await MongoClient.connect(options.mongoUrl, {
      retryWrites: options.retryWrites,
      readPreference: options.readPreference,
      secureContext: options.secureContext
    })
    const databaseName = options.databaseName
    const db = client.db(databaseName)

    //console.log ('starting index creation');
    await createIndexes(db)
    //console.log ('index creation completed');

    server.logger.info(`mongodb connected to ${databaseName}`)

    server.decorate('server', 'mongoClient', client)
    server.decorate('server', 'db', db)
    server.decorate('request', 'db', db)
  }
}

export { mongoPlugin }
