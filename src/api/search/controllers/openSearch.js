import { getDataFromOpenSearch } from '~/src/api/example/helpers/get-os-data'
import { createLogger } from '~/src/helpers/logging/logger'

const openSearchController = {
  handler: async (request, h) => {
    const logger = createLogger()
    try {
      const searchparams = request.payload

      const result = await getDataFromOpenSearch(searchparams)
      return h.response({ plant_detail: result }).code(200)
    } catch (error) {
      logger.error('Error in OpenSearch Controller', error)
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { openSearchController }
