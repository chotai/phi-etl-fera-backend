import { searchPlantDetailsDb } from '~/src/api/search/helpers/search-mongodb'
import { createLogger } from '~/src/helpers/logging/logger'

const logger = createLogger()

const searchController = {
  handler: async (request, h) => {
    try {
      const message = request.payload // POST
      const searchparams = message.search // search params part of search obj in message obj
      const result = await searchPlantDetailsDb(searchparams)
      return h.response({ plant_detail: result }).code(200)
    } catch (error) {
      logger.error('Plant search did not yeild results', error)
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { searchController }
