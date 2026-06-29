const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://www.unidas.com.br",
    viewportWidth: 1280,
    viewportHeight: 720,
    chromeWebSecurity: false,
    defaultCommandTimeout: 15000,
    video: true,
    videosFolder: "cypress/videos",
    screenshotsFolder: "cypress/screenshots",
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
