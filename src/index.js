import { config } from '~/src/config'
import { createServer } from '~/src/api/server'
import { createLogger } from '~/src/helpers/logging/logger'
import { populateDb } from '~/src/helpers/db/populate-db'
import { updateDb } from '~/src/helpers/db/updata-db'

const logger = createLogger()

process.on('unhandledRejection', (error) => {
  logger.info('Unhandled rejection')
  logger.error(error)
  process.exit(1)
})

async function startServer() {
  const server = await createServer()
  await server.start()

  server.logger.info('Server started successfully')
  server.logger.info(
    `Access your backend on http://localhost:${config.get('port')}`
  )
  await server.register(populateDb)
  await server.register(updateDb)
}

startServer().catch((error) => {
  logger.info('Server failed to start :(')
  logger.error(error)
})
