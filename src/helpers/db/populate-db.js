import { createLogger } from '~/src/helpers/logging/logger'
import { populateApi } from '~/src/helpers/db/populate-api'
import path from 'path'
import { config } from '~/src/config'
import { MongoClient } from 'mongodb'
import fs from 'fs/promises'

const logger = createLogger()
const filePathPlant = path.join(__dirname, 'data', 'plants.json')
const filePathCountry = path.join(__dirname, 'data', 'countries.json')
const filePathService = path.join(__dirname, 'data', 'serviceFormat.json')
const filePathServiceAnnex6 = path.join(__dirname, 'data', 'plant_annex6.json')
const filePathServiceAnnex11 = path.join(
  __dirname,
  'data',
  'plant_annex11.json'
)
const filePathServicePestName = path.join(__dirname, 'data', 'pest_name.json')
const filePathServicePlantName = path.join(
  __dirname,
  'data',
  'plant_name_small.json'
)
const filePathServicePlantPestLink = path.join(
  __dirname,
  'data',
  'plant_pest_link.json'
)
const filePathServicePlantPestReg = path.join(
  __dirname,
  'data',
  'plant_pest_reg.json'
)

const mongoUri = config.get('mongoUri') // Get MongoDB URI from the config
const dbName = config.get('mongoDatabase') // Get MongoDB database name from the config

const collectionNamePlant = 'PLANT_DETAIL'
const collectionNameCountry = 'COUNTRIES'
const collectionNameServiceFormat = 'SERVICE_FORMAT'
const collectionNamePlantAnnex6 = 'PLANT_ANNEX6'
const collectionNamePlantAnnex11 = 'PLANT_ANNEX11'
const collectionNamePestName = 'PEST_NAME'
const collectionNamePlantName = 'PLANT_NAME'
const collectionNamePlantPestLink = 'PLANT_PEST_LINK'
const collectionNamePlantPestReg = 'PLANT_PEST_REG'

// Populate the DB in this template on startup of the API.
// This is an example to show developers an API with a DB, with data in it and endpoints that query the db.
const populateDb = {
  plugin: {
    name: 'Populate MongoDb',
    register: async (server) => {
      try {
        await loadData(filePathPlant, mongoUri, dbName, collectionNamePlant, 1)
        await loadData(
          filePathService,
          mongoUri,
          dbName,
          collectionNameServiceFormat,
          1
        )
        await loadData(
          filePathCountry,
          mongoUri,
          dbName,
          collectionNameCountry,
          1
        )
        await loadData(
          filePathServiceAnnex6,
          mongoUri,
          dbName,
          collectionNamePlantAnnex6,
          1
        )
        await loadData(
          filePathServiceAnnex11,
          mongoUri,
          dbName,
          collectionNamePlantAnnex11,
          1
        )
        await loadData(
          filePathServicePestName,
          mongoUri,
          dbName,
          collectionNamePestName,
          1
        )
        await loadData(
          filePathServicePlantName,
          mongoUri,
          dbName,
          collectionNamePlantName,
          1
        )
        await loadData(
          filePathServicePlantPestLink,
          mongoUri,
          dbName,
          collectionNamePlantPestLink,
          1
        )
        await loadData(
          filePathServicePlantPestReg,
          mongoUri,
          dbName,
          collectionNamePlantPestReg,
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

async function loadData(filePath, mongoUri, dbName, collectionName, indicator) {
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
    await dropCollections(db, collectionName, client)
    if (indicator === 1) {
      await collection.insertOne(jsonData)
    } else if (indicator === 2) {
      await collection.insertMany(jsonData)
    }
  } catch (error) {
  } finally {
    await client.close()
  }
}

async function dropCollections(db, collection, client) {
  await db.dropCollection(collection, function (err, result) {
    if (err) {
      // eslint-disable-next-line no-console
      console.error('Error occurred while dropping the collection', err)
      return
    }
    // eslint-disable-next-line no-console
    console.log('Collection dropped successfully')
    client.close()
  })
}
export { populateDb }
