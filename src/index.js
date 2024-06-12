import axios from 'axios'
import { config } from '~/src/config'
import { createServer } from '~/src/api/server'
import { createLogger } from '~/src/helpers/logging/logger'

const logger = createLogger()

process.on('unhandledRejection', (error) => {
  logger.info('Unhandled rejection')
  logger.error(error)
  process.exit(1)
})

async function callDbProcessingEndpoint(url) {
  try {
    const response = await axios.post(url)
    logger.info(response.data.message)
  } catch (error) {
    logger.error(`Failed to call ${url}: ${error.message}`)
  }
}

async function startServer() {
  const server = await createServer()
  await server.start()

  server.logger.info('Server started successfully')
  server.logger.info(
    `Access your backend on http://localhost:${config.get('port')}`
  )
  // Call internal API endpoints for DB processing
  const baseURL = `http://localhost:${config.get('port')}`

  await callDbProcessingEndpoint(`${baseURL}/populateDb`)
  await callDbProcessingEndpoint(`${baseURL}/updateDbPlant`)
  await callDbProcessingEndpoint(`${baseURL}/updateDbPest`)
}

startServer().catch((error) => {
  logger.info('Server failed to start :(')
  logger.error(error)
})
