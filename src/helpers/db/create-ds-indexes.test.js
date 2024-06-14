// tests/createMongoDBIndexes.test.js

import { createMongoDBIndexes } from './create-ds-indexes'
import { createLogger } from '~/src/helpers/logging/logger'

// Mock the dependencies
jest.mock('~/src/helpers/logging/logger')

describe('createMongoDBIndexes', () => {
  let mockCollection
  let mockLogger

  beforeEach(() => {
    mockCollection = {
      createIndex: jest.fn()
    }
    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    }
    createLogger.mockReturnValue(mockLogger)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create indexes and log success messages', async () => {
    const indexHostRef = 'indexHostRef'
    const indexPlantName = 'indexPlantName'

    mockCollection.createIndex
      .mockResolvedValueOnce(indexHostRef)
      .mockResolvedValueOnce(indexPlantName)

    await createMongoDBIndexes(mockCollection)

    expect(mockCollection.createIndex).toHaveBeenCalledWith({ HOST_REF: 1 })
    expect(mockCollection.createIndex).toHaveBeenCalledWith({
      'PLANT_NAME.NAME': 1
    })
  })

  it('should log an error message if index creation fails', async () => {
    const error = new Error('Index creation failed')

    mockCollection.createIndex.mockRejectedValue(error)

    await createMongoDBIndexes(mockCollection)

    expect(mockCollection.createIndex).toHaveBeenCalledWith({ HOST_REF: 1 })
  })
})
