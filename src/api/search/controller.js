import { searchPlantDetailsDb } from '~/src/api/search/helpers/search-mongodb'
let logger = ''

const searchController = {
  handler: async (request, h) => {
    logger = request.logger
    try {
      const searchInput = request.payload // POST
      const extractedText = searchInput.search
      const result = await searchPlantDetailsDb(extractedText, logger)
      return h.response({ plant_detail: result }).code(200)
    } catch (error) {
      logger.error(`Plant search did not yeild results ${error}`)
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { searchController }
