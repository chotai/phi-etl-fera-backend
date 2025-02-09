class workflowEngine {
  constructor(plantDocument, searchInput, countryMapping, cdpLogger) {
    this.data = plantDocument
    this.type = ''
    this.decision = ''
    this.country = searchInput.plantDetails.country
    this.serviceFormat = searchInput.plantDetails.serviceFormat
    this.hostRef = searchInput.plantDetails.hostRef
    this.countryDetails = countryMapping
    this.loggerObj = cdpLogger
  }

  execute() {
    throw new Error("Method 'execute()' must be implemented.")
  }
}

export { workflowEngine }
