import { createLogger } from '~/src/helpers/logging/logger'
import { plantDetail } from '../models/plantDetail'
import { createMongoDBIndexes } from './create-ds-indexes'

const logger = createLogger()

const updateDbPlant = {
  plugin: {
    name: 'Update Plant DB',
    register: async (server) => {
      try {
        await loadData(server.db)
      } catch (error) {
        logger.error(error)
      }
    }
  }
}

async function loadData(db) {
  try {
    logger.info('Connected successfully to server')

    const collections = await loadCollections(db)

    const plantList = collections.plantDocuments
    const annex11List = collections.annex11Documents[0]?.PLANT_ANNEX11 || []
    const annex6List = collections.annex6Documents[0]?.PLANT_ANNEX6 || []
    const plantPestLinkList = collections.plantPestLinkDocuments
    const plantPestRegList =
      collections.plantPestRegDocuments[0]?.PLANT_PEST_REG || []
    const pestNamesList = collections.pestNameDocuments[0]?.PEST_NAME || []
    const pestDistributionList =
      collections.pestDistributionDocuments[0]?.PEST_DISTRIBUTION || []

    await clearCollectionIfExists(db, 'PLANT_DATA')
    const resultList = buildResultList(plantList)

    logger.info(`resultList: ${resultList.length}`)

    // ANNEX 6 and ANNEX 11
    const annex6ResultList = mapAnnex6(resultList, annex6List)
    const annex11ResultList = mapAnnex11(resultList, annex11List)
    const annex11ResultListParentHost = mapAnnex11ParentHost(
      resultList,
      annex11List
    )
    const annex11ResultListParent = mapAnnex11Parent(
      resultList,
      plantList,
      annex11List
    )
    const annex11ResultListDefault = annex11List.filter(
      (n11) => +n11.HOST_REF === 99999
    )

    // Rule 1(HOST_REF) and Rule 4(DefaultAnnex11)
    updateResultListWithAnnex11(
      resultList,
      annex11ResultList,
      annex11ResultListDefault
    )
    // Rule 2(PARENT_HOST_REF)
    updateResultListWithAnnex11ParentHost(
      resultList,
      annex11ResultListParentHost
    )
    updateResultListWithAnnex11Parent(resultList, annex11ResultListParent)

    updateResultListWithAnnex6(resultList, annex6ResultList)

    const pestLinkResultList = mapPestLink(resultList, plantPestLinkList)
    logger.info(`pestLinkResultList: ${pestLinkResultList.length}`)
    updateResultListWithPestLink(resultList, pestLinkResultList)

    updateResultListWithPestNames(resultList, pestNamesList)
    updateResultListWithPestReg(resultList, plantPestRegList)
    updateResultListWithPestCountry(resultList, pestDistributionList)

    await insertResultList(db, resultList)
  } catch (err) {
    logger.error(err)
  }
}

async function loadCollections(db) {
  const collections = {}
  collections.plantDocuments = await db
    .collection('PLANT_NAME')
    .find({})
    .toArray()
  collections.annex11Documents = await db
    .collection('PLANT_ANNEX11')
    .find({})
    .toArray()
  collections.annex6Documents = await db
    .collection('PLANT_ANNEX6')
    .find({})
    .toArray()
  collections.plantPestLinkDocuments = await db
    .collection('PLANT_PEST_LINK')
    .find({})
    .toArray()
  collections.plantPestRegDocuments = await db
    .collection('PLANT_PEST_REG')
    .find({})
    .toArray()
  collections.pestNameDocuments = await db
    .collection('PEST_NAME')
    .find({})
    .toArray()
  collections.pestDistributionDocuments = await db
    .collection('PEST_DISTRIBUTION')
    .find({})
    .toArray()
  return collections
}

async function clearCollectionIfExists(db, collectionName) {
  const collections = await db
    .listCollections({ name: collectionName })
    .toArray()
  if (collections.length > 0) {
    await db.collection(collectionName).drop()
    logger.info(`Collection ${collectionName} dropped.`)
  }
}

function buildResultList(plantList) {
  return plantList.map((plant) => {
    const plDetail = plantDetail.get('plantDetail')
    plDetail.EPPO_CODE = plant?.EPPO_CODE
    plDetail.HOST_REF = plant?.HOST_REF
    plDetail.TAXONOMY = plant?.TAXONOMY
    plDetail.PARENT_HOST_REF = plant?.PARENT_HOST_REF

    plDetail.PLANT_NAME = [
      { type: 'LATIN_NAME', NAME: plant?.LATIN_NAME },
      {
        type: 'COMMON_NAME',
        NAME: plant?.COMMON_NAME?.NAME.filter((name) => name !== '')
      },
      {
        type: 'SYNONYM_NAME',
        NAME: plant?.SYNONYM_NAME?.NAME.filter((name) => name !== '')
      }
    ]

    return plDetail
  })
}

function mapAnnex6(resultList, annex6List) {
  return resultList.map((nx6) => {
    const nx6List = annex6List.filter((n6) => n6.HOST_REF === nx6.HOST_REF)
    return { HOST_REF: nx6.HOST_REF, ANNEX6: nx6List }
  })
}

function mapAnnex11(resultList, annex11List) {
  return resultList.map((nx11) => {
    const nx11List = annex11List.filter(
      (n11) => +n11.HOST_REF === +nx11.HOST_REF
    )
    return { HOST_REF: nx11.HOST_REF, ANNEX11: nx11List }
  })
}

// Rule 1(HOST_REF) and Rule 4(DefaultAnnex11)
function updateResultListWithAnnex11(
  resultList,
  annex11ResultList,
  annex11ResultListDefault
) {
  resultList.forEach((x) => {
    annex11ResultList.forEach((nx11) => {
      if (x.HOST_REF === nx11.HOST_REF) {
        x.HOST_REGULATION.ANNEX11 = [
          ...nx11.ANNEX11,
          ...annex11ResultListDefault
        ]
      } else if (x.HOST_REGULATION.ANNEX11.length === 0) {
        x.HOST_REGULATION.ANNEX11 = annex11ResultListDefault
      }
    })
  })
}

// ANNEX11 - Rule 2 - using PARENT_HOST_REF
function mapAnnex11ParentHost(resultList, annex11List) {
  return resultList
    .map((nx11) => {
      if (nx11.PARENT_HOST_REF && nx11.PARENT_HOST_REF !== '') {
        const nx11List = annex11List.filter(
          (n11) => +n11.PARENT_HOST_REF === +nx11.PARENT_HOST_REF
        )
        if (nx11List.length > 0) {
          return { HOST_REF: nx11.HOST_REF, ANNEX11: nx11List }
        }
      }
      return null
    })
    .filter((item) => item !== null)
}

// ANNEX11 Rule 3 - Find a matching HOST_REF (FAMILY) in PLANT_NAME Collection from PLANT_DATA using PARENT_HOST_REF
function mapAnnex11Parent(resultList, plantList, annex11List) {
  const resultListParent = resultList
    .map((pl) => plantList.find((r) => +r.HOST_REF === +pl.PARENT_HOST_REF))
    .filter((element) => element !== undefined)

  return resultListParent.map((nx11) => {
    const nx11List = annex11List.filter(
      (n11) => +n11.HOST_REF === +nx11.HOST_REF
    )
    return { HOST_REF: nx11.HOST_REF, ANNEX11: nx11List }
  })
}

// MAP ANNEX11 Rule 2
function updateResultListWithAnnex11ParentHost(
  resultList,
  annex11ResultListParentHost
) {
  resultList.forEach((x) => {
    annex11ResultListParentHost.forEach((nx11) => {
      if (x.HOST_REF === nx11.HOST_REF) {
        x.HOST_REGULATION.ANNEX11 = [
          ...x.HOST_REGULATION.ANNEX11,
          ...nx11.ANNEX11
        ]
      }
    })
  })
}

// MAP ANNEX11 Rule 3
function updateResultListWithAnnex11Parent(
  resultList,
  annex11ResultListParent
) {
  resultList.forEach((x) => {
    annex11ResultListParent.forEach((nx11) => {
      if (x.HOST_REF === nx11.HOST_REF) {
        x.HOST_REGULATION.ANNEX11 = [
          ...x.HOST_REGULATION.ANNEX11,
          ...nx11.ANNEX11
        ]
      }
    })
  })
}

function updateResultListWithAnnex6(resultList, annex6ResultList) {
  resultList.forEach((x) => {
    annex6ResultList.forEach((nx6) => {
      if (x.HOST_REF === nx6.HOST_REF) {
        x.HOST_REGULATION.ANNEX6 = nx6.ANNEX6
      }
    })
  })
}

function mapPestLink(resultList, plantPestLinkList) {
  return resultList.map((plantItem) => {
    const pplList = plantPestLinkList
      .filter((cListItem) => cListItem.HOST_REF === plantItem.HOST_REF)
      .map((cListItem) => ({
        CSL_REF: cListItem.CSL_REF,
        HOST_CLASS: cListItem.HOST_CLASS,
        PEST_NAME: { TYPE: '', NAME: '' },
        EPPO_CODE: '',
        FORMAT: { FORMAT: '', FORMAT_ID: '' },
        LATIN_NAME: '',
        PARENT_CSL_REF: '',
        PEST_COUNTRY: [
          { COUNTRY_CODE: '', COUNTRY_NAME: '', COUNTRY_STATUS: '' }
        ],
        REGULATION: '',
        QUARANTINE_INDICATOR: '',
        REGULATED_INDICATOR: ''
      }))

    return {
      HOST_REF: plantItem.HOST_REF,
      PEST_LINK: pplList
    }
  })
}

function updateResultListWithPestLink(resultList, pestLinkResultList) {
  resultList.forEach((x) => {
    pestLinkResultList.forEach((pest) => {
      if (x?.HOST_REF === pest?.HOST_REF) {
        x.PEST_LINK = pest?.PEST_LINK
      }
    })
  })
}

function updateResultListWithPestNames(resultList, pestNamesList) {
  resultList.forEach((pl) => {
    pestNamesList.forEach((pest) => {
      pl.PEST_LINK?.forEach((x) => {
        if (x?.CSL_REF === pest?.CSL_REF) {
          x.PEST_NAME = [
            { type: 'LATIN_NAME', NAME: pest?.LATIN_NAME },
            {
              type: 'COMMON_NAME',
              NAME: pest?.COMMON_NAME?.COMMON_NAME.filter((name) => name !== '')
            },
            {
              type: 'SYNONYM_NAME',
              NAME: pest?.SYNONYM_NAME?.SYNONYM_NAME.filter(
                (name) => name !== ''
              )
            }
          ]
          x.EPPO_CODE = pest.EPPO_CODE
        }
      })
    })
  })
}

function updateResultListWithPestReg(resultList, plantPestRegList) {
  resultList.forEach((pl) => {
    plantPestRegList.forEach((pest) => {
      pl.PEST_LINK?.forEach((x) => {
        if (x?.CSL_REF === pest?.CSL_REF) {
          if (['Q', 'P'].includes(pest?.QUARANTINE_INDICATOR)) {
            x.REGULATION = pest?.REGULATION
            x.QUARANTINE_INDICATOR = pest?.QUARANTINE_INDICATOR
            x.REGULATED_INDICATOR = pest?.REGULATED_INDICATOR
          } else if (
            pest?.QUARANTINE_INDICATOR === 'R' &&
            pl?.HOST_REF === pest?.HOST_REF
          ) {
            x.REGULATION = pest?.REGULATION
            x.QUARANTINE_INDICATOR = pest?.QUARANTINE_INDICATOR
            x.REGULATED_INDICATOR = pest?.REGULATED_INDICATOR
          }
        }
      })
    })
  })
}

function updateResultListWithPestCountry(resultList, pestDistributionList) {
  const cslRefMap = {}

  resultList.forEach((item) => {
    item.PEST_LINK.forEach((pestLink) => {
      pestDistributionList.forEach((distribution) => {
        if (pestLink.CSL_REF === distribution.CSL_REF) {
          if (!cslRefMap[pestLink.CSL_REF]) {
            cslRefMap[pestLink.CSL_REF] = []
          }
          cslRefMap[pestLink.CSL_REF].push({
            COUNTRY_NAME: distribution.COUNTRY_NAME,
            COUNTRY_CODE: distribution.COUNTRY_CODE,
            STATUS: distribution.STATUS
          })
        }
      })
    })
  })

  Object.keys(cslRefMap).forEach((cslRef) => {
    const seen = new Set()
    cslRefMap[cslRef] = cslRefMap[cslRef].filter((country) => {
      if (seen.has(country.COUNTRY_CODE)) {
        return false
      } else {
        seen.add(country.COUNTRY_CODE)
        return true
      }
    })
  })

  const countryResultList = Object.keys(cslRefMap).map((cslRef) => ({
    CSL_REF: parseInt(cslRef, 10),
    COUNTRIES: cslRefMap[cslRef]
  }))

  resultList.forEach((pl) => {
    countryResultList.forEach((pest) => {
      pl.PEST_LINK.forEach((x) => {
        if (x?.CSL_REF === pest?.CSL_REF) {
          x.PEST_COUNTRY = pest?.COUNTRIES
        }
      })
    })
  })
}

async function insertResultList(db, resultList) {
  const collectionNew = db.collection('PLANT_DATA')
  const result = await collectionNew.insertMany(resultList)
  logger.info(`${result.insertedCount} plant documents were inserted...`)
  await createMongoDBIndexes(collectionNew)
}

export { updateDbPlant }
