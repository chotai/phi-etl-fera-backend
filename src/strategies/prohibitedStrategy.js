import { workflowEngine } from './workflowEngine'

let logger = ''
let plantInfo = ''
let pestDetails = []
const pestArray = []
let [property, expectedValue] = ''

class ProhibitedStrategy extends workflowEngine {
  constructor(plantDocument, searchInput, countryMapping, cdpLogger) {
    super(plantDocument, searchInput, countryMapping, cdpLogger)
    this.type = ['6A1', '6B5']
    this.decision = 'prohibited'
    logger = this.loggerObj
  }

  async execute() {
    logger.info('Check if Annex6 (PROHIBITED) rule applies?')

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

    const innsProhibitedObj = this

    // Level 1 check: Go through host regulations to check if ANNEX6 (Prohibited) rule is applicable
    // at country level?
    logger.info('Level 1: Starting Prohibited check at country level')
    if (Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach((annex) => {
        if (
          annex.COUNTRY_NAME.toLowerCase() ===
            innsProhibitedObj.country.toLowerCase() &&
          annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
          innsProhibitedObj.type.map((t) =>
            t.toLowerCase().includes(annex.A6_RULE.toLowerCase())
          ) &&
          annex.OVERALL_DECISION.toLowerCase() === this.decision.toLowerCase()
        ) {
          logger.info(
            `Annex6 (PROHIBITED) rule applicable at country level, ${annex.A6_RULE}`
          )
          plantInfo.annexSixRule = annex.A6_RULE
          plantInfo.outcome = annex.OVERALL_DECISION
        }
      })
    }

    let formattedAnnex = ''
    // Level 2 check: Go through host regulations to check if ANNEX6 (INNS) rule is applicable
    // at 'Region' or 'All' level?
    logger.info('Level 2: Starting Prohibited check at Region/All level')
    if (
      !plantDocument.outcome &&
      Array.isArray(plantDocument.HOST_REGULATION.ANNEX6)
    ) {
      plantDocument.HOST_REGULATION.ANNEX6.forEach(function (annex) {
        logger.info(
          `Step 1 (loop through each annex), ${annex.A6_RULE}, ${annex.COUNTRY_NAME}`
        )

        if (
          annex.SERVICE_FORMAT.toLowerCase() ===
            innsProhibitedObj.serviceFormat.toLowerCase() &&
          annex.OVERALL_DECISION.toLowerCase() ===
            innsProhibitedObj.decision.toLowerCase()
        ) {
          logger.info('Step 2 (match Annex Country Name with Country Details')

          formattedAnnex = annex.COUNTRY_NAME.replace(/[()\s-]+/g, '')
          property = formattedAnnex.split(',')[0]
          expectedValue = formattedAnnex.split(',')[1]

          if (expectedValue !== innsProhibitedObj.country) {
            const region = innsProhibitedObj.countryDetails.REGION
            const regionArray = region.split(';')
            let regionItem = ''
            let regionFormatted = ''

            regionArray.forEach(function (reg) {
              regionItem = reg.replace(/[()\s-]+/g, '')
              regionFormatted = regionItem.split(',')
              logger.info(
                `formatted region is: ${regionFormatted[0]}, ${regionFormatted[1]}`
              )

              if (
                regionFormatted[0].toLowerCase() === property.toLowerCase() &&
                regionFormatted[1].toLowerCase() === expectedValue.toLowerCase()
              ) {
                logger.info(
                  `Annex6 (PROHIBITED) rule applicable at country/all level, ${annex.A6_RULE}`
                )
                plantInfo.annexSixRule = annex.A6_RULE
                plantInfo.outcome = annex.OVERALL_DECISION
              }
            })
          }
        }
      })
    }
    const importCountry = this.country.toLowerCase()
    // Get the pests corresponding to the country
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

    logger.info('Annex6 (PROHIBITED) check performed')
    return plantInfo
  }
}
export { ProhibitedStrategy }
