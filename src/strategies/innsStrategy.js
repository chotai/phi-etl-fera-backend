import { workflowEngine } from './workflowEngine'

let logger = ''
let plantInfo = ''
let pestDetails = []
const pestArray = []

class InnsStrategy extends workflowEngine {
  constructor(plantDocument, searchInput, countryMapping, cdpLogger) {
    super(plantDocument, searchInput, countryMapping, cdpLogger)
    this.type = 'INNS'
    this.decision = 'prohibited'
    logger = this.loggerObj
  }

  async execute() {
    logger.info('Check if Annex6 (INNS) rule applies?')

    const plantDocument = this.data
    plantInfo = {
      hostRef: this.hostRef,
      country: this.country,
      eppoCode: plantDocument.EPPO_CODE,
      plantName: plantDocument.PLANT_NAME,
      annexSixRule: '',
      annexElevenRule: '',
      outcome: '',
      pestDetails
    }

    const innsStrategyObj = this
    // Level 1 check: Go through host regulations to check if ANNEX6 (INNS) rule is applicable
    // at All country level?
    logger.info('Level 1: Starting INNS check at Region & All level')
    if (
      !plantDocument.outcome &&
      Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)
    ) {
      logger.info('Inside level 1 INNS check - step 1 ')

      plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
        if (
          annex.SERVICE_FORMAT.toLowerCase() ===
            innsStrategyObj.serviceFormat.toLowerCase() &&
          annex.OVERALL_DECISION.toLowerCase() ===
            innsStrategyObj.decision.toLowerCase() &&
          annex.COUNTRY_NAME.toLowerCase() === 'all'
        ) {
          logger.info('inside level 1 INNS check - step 2 ')

          logger.info(
            `Annex6 (INNS) rule applicable for 'all' countries, ${annex.A6_RULE}`
          )
          plantInfo.annexSixRule = annex.A6_RULE
          plantInfo.outcome = annex.OVERALL_DECISION
        }
      })
    }

    // 10 June, 2024: As per BA team, INNS is not applicable at country level only All level,
    // once this is confirmed the condition will be removed.

    // Level 2 check: Go through host regulations to check if ANNEX6 (INNS) rule is applicable
    // at the country level?
    logger.info('Level 2: Starting INNS check at country level')
    if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach((annex) => {
        if (
          annex.COUNTRY_NAME.toLowerCase() ===
            innsStrategyObj.country.toLowerCase() &&
          annex.SERVICE_FORMAT.toLowerCase() ===
            innsStrategyObj.serviceFormat.toLowerCase() &&
          annex.A6_RULE.toLowerCase() === innsStrategyObj.type.toLowerCase()
        ) {
          logger.info('inside level 2 check block ')
          logger.info(
            `Annex6 (INNS) applicable at country level, ${annex.A6_RULE}`
          )
          plantInfo.annexSixRule = annex.A6_RULE
          plantInfo.outcome = annex.OVERALL_DECISION
        }
      })
    }

    // Get the pests corresponding to the country
    const importCountry = innsStrategyObj.country.toLowerCase()
    pestDetails = {
      pestNames: plantDocument.PEST_LINK.filter(function (item) {
        const hasMatch = item.PEST_COUNTRY?.filter(function (cname) {
          if (cname.COUNTRY_NAME.toLowerCase() === importCountry) {
            pestArray.push({
              name: item.PEST_NAME,
              format: item.FORMAT,
              quarantine_indicator: item.QUARANTINE_INDICATOR,
              regulated_indicator: item.REGULATED_INDICATOR
            })
          }
          return cname
        })
        return hasMatch
      })
    }

    plantInfo.pestDetails = pestArray

    logger.info('Annex6 (INNS) check performed')
    return plantInfo
  }
}
export { InnsStrategy }
