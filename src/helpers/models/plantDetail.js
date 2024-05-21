const plantDetail = {
  EPPO_CODE: 'string',
  GENUS_NAME: 'plant',
  HOST_REF: 'string',
  HOST_REGULATION: {
    ANNEX11: {
      A11_RULE: 'string',
      BTOM: 'string',
      BTOM_CLARIFICATION: 'string',
      BTOM_NON_EUSL: 'string',
      COUNTRY_CODE: 'string',
      COUNTRY_NAME: 'string',
      IMPORT_RULE: 'string',
      IMPORT_RULE_NON_EUSL: 'string',
      INFERRED: 'string',
      SERVICE_FORMAT: 'string',
      SERVICE_SUB_FORMAT: 'string',
      SERVICE_SUB_FORMAT_EXCLUDED: 'string'
    },
    ANNEX6: {
      A6_RULE: 'string',
      COUNTRY_CODE: 'string',
      COUNTRY_NAME: 'string',
      FORMAT_CLARIFICATION: 'string',
      FORMAT_EXCLUDED: {
        FORMAT_ID: 'string',
        FORMAT_NAME: 'string'
      },
      HYBRID_INDICATOR: 'string',
      OVERALL_DECISION: 'string',
      PROHIBITION_CLARIFICATION: 'string',
      SERVICE_FORMAT: 'string'
    }
  },
  LATIN_NAME: 'string',
  PARENT_HOST_REF: 'string',
  PEST_LINK: {
    PEST_NAME: {
      TYPE: 'string',
      NAME: 'string'
    },
    CSL_REF: 'string',
    EPPO_CODE: 'string',
    FORMAT: {
      FORMAT: 'string',
      FORMAT_ID: 'string'
    },
    HOST_CLASS: 'string',
    LATIN_NAME: 'string',
    PARENT_CSL_REF: 'string',
    PEST_COUNTRY: [
      {
        COUNTRY_CODE: 'string',
        COUNTRY_NAME: 'string',
        COUNTRY_STATUS: 'string'
      }
    ],
    REGULATION: 'string',
    QUARANTINE_INDICATOR: 'string',
    REGULATED_INDICATOR: 'string'
  },
  PLANT_NAME: [
    {
      NAME: 'string',
      TYPE: 'string'
    },
    {
      NAME: 'string',
      NAME_TYPE: 'string'
    }
  ],
  SPECIES_NAME: 'string',
  TAXONOMY: 'string'
}

module.exports = { plantDetail }
