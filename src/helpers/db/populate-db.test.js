// tests/populateDb.test.js

import { populateDb } from './populate-db'
import { createLogger } from '~/src/helpers/logging/logger'
import { MongoClient } from 'mongodb'
import fs from 'fs/promises'
import path from 'path'

jest.mock('~/src/helpers/logging/logger')
jest.mock('mongodb')
jest.mock('fs/promises')
jest.mock('path', () => ({
  join: jest.fn()
}))

describe('populateDb plugin', () => {
  let mockServer, mockDb, mockCollection, mockClient, logger

  beforeEach(() => {
    mockCollection = {
      insertOne: jest.fn(),
      insertMany: jest.fn()
    }

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
      listCollections: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(['PLANT', 'COUNTRY'])
      }),
      dropCollection: jest.fn().mockImplementation((name, cb) => cb(null, true))
    }

    mockClient = {
      connect: jest.fn(),
      close: jest.fn()
    }

    MongoClient.mockReturnValue(mockClient)

    mockServer = {
      db: mockDb,
      start: jest.fn()
    }

    logger = {
      error: jest.fn(),
      info: jest.fn()
    }

    createLogger.mockReturnValue(logger)

    fs.readFile.mockResolvedValue(
      JSON.stringify({ PLANT_NAME: [], PLANT_PEST_LINK: [] })
    )
    path.join.mockImplementation((...args) => args.join('/'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should load data into MongoDB collections and start the server', async () => {
    await populateDb.plugin.register(mockServer)

    expect(mockServer.start).toHaveBeenCalled()
    expect(mockDb.collection).toHaveBeenCalledWith('PLANT_DETAIL')
    expect(mockDb.collection).toHaveBeenCalledWith('COUNTRIES')
    expect(mockDb.collection).toHaveBeenCalledWith('SERVICE_FORMAT')
    expect(mockDb.collection).toHaveBeenCalledWith('PLANT_ANNEX6')
    expect(mockDb.collection).toHaveBeenCalledWith('PLANT_ANNEX11')
    expect(mockDb.collection).toHaveBeenCalledWith('PEST_NAME')
    expect(mockDb.collection).toHaveBeenCalledWith('PLANT_NAME')
    expect(mockDb.collection).toHaveBeenCalledWith('PLANT_PEST_LINK')
    expect(mockDb.collection).toHaveBeenCalledWith('PLANT_PEST_REG')
    expect(mockDb.collection).toHaveBeenCalledWith('PEST_DISTRIBUTION')
    expect(mockDb.collection).toHaveBeenCalledWith('PEST_DOCUMENT_FCPD')
    expect(mockDb.collection).toHaveBeenCalledWith('PEST_PRA_DATA')
  })
})
