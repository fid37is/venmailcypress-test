import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Base URL from environment variable
    baseUrl: process.env.CYPRESS_BASE_URL || 'https://app.venmail.io',
    
    // File paths
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    fixturesFolder: 'cypress/fixtures',
    downloadsFolder: 'cypress/downloads',
    
    // Screenshots and videos
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    
    // Viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Timeouts
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    
    // Retries
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Test isolation
    testIsolation: true,
    
    // Environment variables for POM
    env: {
      apiUrl: process.env.API_URL || 'https://api.app.venmail.io',
      environment: process.env.ENVIRONMENT || 'staging'
    },
    
    experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      // Add any plugins here
      
      // Example: Set config based on environment
      if (config.env.environment === 'production') {
        config.baseUrl = 'https://m.venmail.io';
        config.env.apiUrl = 'https://api.m.venmail.io';
      }
      
      return config;
    },
  },
});