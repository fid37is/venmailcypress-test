const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Register @cypress/grep plugin
      require('@cypress/grep/src/plugin')(config);
      
      // Determine which environment to use
      const environment = config.env.ENVIRONMENT || 
                         process.env.CYPRESS_ENVIRONMENT || 
                         process.env.ENVIRONMENT || 
                         'staging';

      console.log(`🌍 Loading configuration for: ${environment.toUpperCase()}`);
      console.log(`📍 Config env before load:`, config.env.ENVIRONMENT);
      console.log(`📍 Process env:`, process.env.ENVIRONMENT);

      // Load environment-specific config file
      const envConfigPath = path.resolve(__dirname, `cypress.env.${environment}.json`);
      
      let envConfig = {};
      if (fs.existsSync(envConfigPath)) {
        envConfig = JSON.parse(fs.readFileSync(envConfigPath, 'utf8'));
        
        // Merge environment-specific config into Cypress config
        config.env = {
          ...config.env,
          ...envConfig,
          ENVIRONMENT: environment
        };
        
        console.log(`✅ Loaded: cypress.env.${environment}.json`);
      } else {
        console.warn(`⚠️  Warning: cypress.env.${environment}.json not found at ${envConfigPath}`);
        console.log(`📝 Available config files:`);
        
        const configDir = __dirname;
        const envFiles = fs.readdirSync(configDir)
          .filter(file => file.startsWith('cypress.env.') && file.endsWith('.json'));
        
        envFiles.forEach(file => console.log(`   - ${file}`));
      }

      // Set baseUrl based on environment
      if (envConfig && envConfig.BASE_URL) {
        config.baseUrl = envConfig.BASE_URL;
        console.log(`📌 Using BASE_URL from config file: ${config.baseUrl}`);
      } else {
        const baseUrls = {
          staging: 'https://app.venmail.io',
          production: 'https://m.venmail.io',
          dev: 'http://localhost:3000'
        };
        config.baseUrl = baseUrls[environment] || baseUrls.staging;
        console.log(`📌 Using default BASE_URL for ${environment}: ${config.baseUrl}`);
      }
      
      console.log(`🔗 Final Base URL: ${config.baseUrl}`);
      console.log(`📊 Environment variables loaded:`, Object.keys(config.env).filter(key => 
        ['ADMIN_EMAIL', 'SALES_EMAIL', 'NORMAL_USER_EMAIL', 'ENVIRONMENT', 'BASE_URL'].includes(key)
      ));

      return config;
    },
    baseUrl: 'https://app.venmail.io',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    experimentalSessionAndOrigin: true,
    testIsolation: false,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Reporter configuration - CRITICAL FOR CI/CD
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/results',
      overwrite: false,
      html: false,
      json: true,
      timestamp: 'mmddyyyy_HHMMss'
    }
  },
});