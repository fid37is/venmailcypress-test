// cypress.config.js - Updated configuration
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'https://app.venmail.io',
    
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    fixturesFolder: 'cypress/fixtures',
    downloadsFolder: 'cypress/downloads',
    
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    
    viewportWidth: 1280,
    viewportHeight: 720,
    
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    testIsolation: true,
    
    env: {
      apiUrl: process.env.API_URL || 'https://api.app.venmail.io',
      environment: process.env.ENVIRONMENT || 'staging'
    },
    
    experimentalSessionAndOrigin: true,
    
    setupNodeEvents(on, config) {
      // Environment-specific configuration
      const environment = config.env.environment || 'staging';
      
      if (environment === 'production') {
        config.baseUrl = 'https://m.venmail.io';
        config.env.apiUrl = 'https://api.m.venmail.io';
        
        // Only run read-only tests in production
        config.specPattern = [
          'cypress/e2e/read-only-prod.cy.js',
          'cypress/e2e/login.cy.js' // Only tests that don't modify data
        ];
      } else if (environment === 'staging') {
        config.baseUrl = 'https://app.venmail.io';
        config.env.apiUrl = 'https://api.app.venmail.io';
        
        // Run all tests in staging
        config.specPattern = 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}';
      }
      
      console.log(`Running tests against: ${config.baseUrl}`);
      console.log(`Environment: ${environment}`);
      
      return config;
    },
  },
});