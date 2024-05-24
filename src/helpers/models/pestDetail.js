import convict from 'convict'
const pestDetail = convict({
  pestDetail: {
    EPPO_CODE: 'string',
    GENUS_NAME: 'string',
    CSL_REF: 'string',
    LATIN_NAME: 'string',
    PARENT_CSL_REF: 'string',
    QUARANTINE_INDICATOR: 'string',
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
        PLANT_NAME: {
          TYPE: 'string',
          NAME: 'string'
        },
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
    DOCUMENT_LINK: [
      {
        TYPE: 'string',
        NAME: 'string',
        VISIBLE_ON_PORTAL_INDICATOR: 'string',
        PUBLICATION_DATE: 'string',
        DOCUMENT_SIZE: 'string',
        NO_OF_PAGE: 'string',
        DOCUMENT_FORMAT: 'string',
        PARENT_CSL_REF: 'string'
      }
    ],
    SPECIES_NAME: 'string',
    TAXONOMY: 'string'
  }
})

pestDetail.validate({ allowed: 'strict' })

export { pestDetail }
