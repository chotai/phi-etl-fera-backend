import convict from 'convict'
const pestDetail = convict({
  pestDetail: {
    EPPO_CODE: 'string',
    GENUS_NAME: 'string',
    CSL_REF: 'string',
    LATIN_NAME: 'string',
    PARENT_CSL_REF: 'string',
    QUARANTINE_INDICATOR: 'string',
    REGULATION_CATEGORY: 'string',
    REGULATION_INDICATOR: 'string',
    PEST_NAME: [
      {
        NAME: 'string',
        TYPE: 'string'
      },
      {
        NAME: 'string',
        NAME_TYPE: 'string'
      }
    ],
    PLANT_LINK: [
      {
        PLANT_NAME: [
          {
            TYPE: 'string',
            NAME: 'string'
          }
        ],
        HOST_REF: 'string',
        EPPO_CODE: 'string',
        HOST_CLASS: 'string',
        LATIN_NAME: 'string',
        PARENT_HOST_REF: 'string'
      }
    ],
    PEST_COUNTRY_DISTRIBUTION: [
      {
        COUNTRY_CODE: 'string',
        COUNTRY_NAME: 'string',
        COUNTRY_STATUS: 'string'
      }
    ],
    PEST_RISK_STATUS: 'string',
    DOCUMENT_LINK: [],
    SPECIES_NAME: 'string',
    TAXONOMY: 'string'
  }
})

pestDetail.validate({ allowed: 'strict' })

export { pestDetail }
