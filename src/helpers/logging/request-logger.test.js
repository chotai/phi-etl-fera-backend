import hapiPino from 'hapi-pino'
import { loggerOptions } from '~/src/helpers/logging/logger-options'
import { requestLogger } from '~/src/helpers/logging/request-logger' // Adjust the import according to the file location

jest.mock('hapi-pino')
jest.mock('~/src/helpers/logging/logger-options')

describe('requestLogger', () => {
  it('should use hapiPino as the plugin and loggerOptions as the options', () => {
    expect(requestLogger).toEqual({
      plugin: hapiPino,
      options: loggerOptions
    })
  })
})
