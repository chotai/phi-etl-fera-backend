import { WorkflowStrategyFactory } from '~/src/factories/workflowStrategyFactory'

let logger = ''
const processHandler = async (request, h) => {
  logger = request.logger
  logger.info(`plant request: ${request.payload}`)
  const data = request.payload
  logger.info(`triggering the workflow...`)
  const wfStrategy = new WorkflowStrategyFactory(logger)
  const strategy = await wfStrategy.initateStrategy(data, request.db)
  return strategy
}

export { processHandler }
