// __tests__/updateDbPlantHandler.test.js

import {
  updateDbPlantHandler,
  loadCollections,
  buildResultList
} from './update-db-plant'
import { createLogger } from '~/src/helpers/logging/logger'
import { plantList } from './mocks/plant_name'
jest.mock('~/src/helpers/logging/logger', () => ({
  createLogger: jest.fn()
}))

const logger = {
  info: jest.fn(),
  error: jest.fn()
}
createLogger.mockReturnValue(logger)

const mockResponse = {
  response: jest.fn().mockReturnThis(),
  code: jest.fn().mockReturnThis()
}

describe('updateDbPlantHandler', () => {
  let db
  let request

  beforeEach(() => {
    db = {
      collection: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      listCollections: jest.fn().mockReturnThis(),
      drop: jest.fn()
    }
    request = {
      server: {
        db
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('loadData', () => {
    it('should return success response when loadData is successful', async () => {
      db.collection('PLANT_NAME').find().toArray.mockResolvedValue([])
      db.collection('PLANT_ANNEX11').find().toArray.mockResolvedValue([])
      db.collection('PLANT_ANNEX6').find().toArray.mockResolvedValue([])
      db.collection('PLANT_PEST_LINK').find().toArray.mockResolvedValue([])
      db.collection('PLANT_PEST_REG').find().toArray.mockResolvedValue([])
      db.collection('PEST_NAME').find().toArray.mockResolvedValue([])
      db.collection('PEST_DISTRIBUTION').find().toArray.mockResolvedValue([])
      db.listCollections().toArray.mockResolvedValue([])

      const h = { ...mockResponse }

      await updateDbPlantHandler(request, h)

      expect(h.response).toHaveBeenCalledWith({
        status: 'success',
        message: 'Populate Plant Db successful'
      })
      expect(h.code).toHaveBeenCalledWith(200)
    })

    it('should build a lit of collections', async () => {
      db.listCollections().toArray.mockResolvedValue([])

      const collections = await loadCollections(db)
      expect(collections).toEqual({
        plantDocuments: [],
        annex11Documents: [],
        annex6Documents: [],
        plantPestLinkDocuments: [],
        plantPestRegDocuments: [],
        pestNameDocuments: [],
        pestDistributionDocuments: []
      })
    })

    it('should build a plant list', async () => {
      db.listCollections().toArray.mockResolvedValue([])

      const plantListMock = plantList
      const resultList = buildResultList(plantListMock)
      expect(resultList.length).toEqual(3)
    })

    it('should return error response when loadData throws an error', async () => {
      const error = new Error('Test error')
      db.collection('PLANT_NAME').find().toArray.mockRejectedValue(error)

      const h = { ...mockResponse }

      await updateDbPlantHandler(error, h)

      expect(h.code).toHaveBeenCalledWith(500)
    })
  })
})
