import { search } from '~/src/api/search'
import { workflow } from '~/src/api/workflow'
import { populateDb } from '~/src/helpers/db/populate-db'
import { updateDbPlant } from '~/src/helpers/db/update-db-plant'
import { updateDbPest } from '~/src/helpers/db/update-db-pest'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([
        search,
        workflow,
        populateDb,
        updateDbPlant,
        updateDbPest
      ])
    }
  }
}

export { router }
