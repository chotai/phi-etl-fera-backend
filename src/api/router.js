import { search } from '~/src/api/search'
import { workflow } from '~/src/api/workflow'
import { etl } from '~/src/api/etl'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([search, workflow, etl])
    }
  }
}

export { router }
