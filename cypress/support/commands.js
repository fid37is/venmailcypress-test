// cypress/support/commands.js - Secure version with environment variables
import LoginPage from "../pages/LoginPage";

/**
 * Get user credentials from environment variables (secure)
 * Passwords come from env vars, not fixture files
 */
Cypress.Commands.add('getUser', (userType) => {
  const userMap = {
    existingAdminUser: {
      email: Cypress.env('ADMIN_EMAIL'),
      password: Cypress.env('ADMIN_PASSWORD'),
      role: 'admin'
    },
    existingSalesUser: {
      email: Cypress.env('SALES_EMAIL'),
      password: Cypress.env('SALES_PASSWORD'),
      role: 'sales'
    },
    normalUser: {
      email: Cypress.env('NORMAL_USER_EMAIL'),
      password: Cypress.env('NORMAL_USER_PASSWORD'),
      firstName: Cypress.env('NORMAL_USER_FIRSTNAME') || 'Testorone',
      lastName: Cypress.env('NORMAL_USER_LASTNAME') || 'User',
      role: 'user'
    }
  };

  const user = userMap[userType];
  
  if (!user) {
    throw new Error(`Unknown user type: ${userType}. Available: ${Object.keys(userMap).join(', ')}`);
  }

  if (!user.email || !user.password) {
    throw new Error(
      `Missing credentials for ${userType}. ` +
      `Ensure environment variables are set in cypress.env.json (local) or GitHub Secrets (CI).`
    );
  }

  return cy.wrap(user);
});

/**
 * Get all users (returns a promise)
 */
Cypress.Commands.add('getUsers', () => {
  const users = {
    existingAdminUser: {
      email: Cypress.env('ADMIN_EMAIL'),
      password: Cypress.env('ADMIN_PASSWORD'),
      role: 'admin'
    },
    existingSalesUser: {
      email: Cypress.env('SALES_EMAIL'),
      password: Cypress.env('SALES_PASSWORD'),
      role: 'sales'
    },
    normalUser: {
      email: Cypress.env('NORMAL_USER_EMAIL'),
      password: Cypress.env('NORMAL_USER_PASSWORD'),
      firstName: Cypress.env('NORMAL_USER_FIRSTNAME') || 'Testorone',
      lastName: Cypress.env('NORMAL_USER_LASTNAME') || 'User',
      role: 'user'
    }
  };

  return cy.wrap(users);
});

/**
 * Login with session caching - environment aware
 */
Cypress.Commands.add('loginAsUser', (email, password) => {
  const env = Cypress.env('ENVIRONMENT') || Cypress.env('environment') || 'staging';
  
  cy.session(
    [email, password, env],
    () => {
      const loginPage = new LoginPage();
      loginPage.visit();
      loginPage.login(email, password);
      loginPage.verifyDashboard();
    },
    {
      validate() {
        cy.getCookie('session').should('exist');
      },
      cacheAcrossSpecs: true
    }
  );
  // Visit dashboard after session restore
  cy.visit('/m/all');
});

/**
 * Admin login with session - secure version
 */
Cypress.Commands.add('adminLogin', () => {
  const env = Cypress.env('ENVIRONMENT') || Cypress.env('environment') || 'staging';
  
  cy.session(['admin-session', env], () => {
    cy.getUser('existingAdminUser').then(user => {
      cy.visit('/login');
      const loginPage = new LoginPage();
      loginPage.login(user.email, user.password);
      cy.contains('Welcome to your Venmail', { timeout: 30000 }).should('be.visible');
    });
  }, {
    cacheAcrossSpecs: true
  });
  cy.visit('/m/all');
});

/**
 * Normal user login with session - secure version
 */
Cypress.Commands.add('normalUserLogin', () => {
  const env = Cypress.env('ENVIRONMENT') || Cypress.env('environment') || 'staging';
  
  cy.session(['normal-user-session', env], () => {
    cy.getUser('normalUser').then(user => {
      cy.visit('/login');
      const loginPage = new LoginPage();
      loginPage.login(user.email, user.password);
      cy.url({ timeout: 30000 }).should('include', '/m/all');
    });
  }, {
    cacheAcrossSpecs: true
  });
  cy.visit('/m/all');
});

/**
 * Sales user login with session - secure version
 */
Cypress.Commands.add('salesUserLogin', () => {
  const env = Cypress.env('ENVIRONMENT') || Cypress.env('environment') || 'staging';
  
  cy.session(['sales-user-session', env], () => {
    cy.getUser('existingSalesUser').then(user => {
      cy.visit('/login');
      const loginPage = new LoginPage();
      loginPage.login(user.email, user.password);
      cy.url({ timeout: 30000 }).should('include', '/m/all');
    });
  }, {
    cacheAcrossSpecs: true
  });
  cy.visit('/m/all');
});

/**
 * Generic login by user type
 */
Cypress.Commands.add('loginAs', (userType) => {
  const env = Cypress.env('ENVIRONMENT') || Cypress.env('environment') || 'staging';
  
  cy.session([`${userType}-session`, env], () => {
    cy.getUser(userType).then(user => {
      cy.visit('/login');
      const loginPage = new LoginPage();
      loginPage.login(user.email, user.password);
      cy.url({ timeout: 30000 }).should('not.include', '/login');
    });
  }, {
    cacheAcrossSpecs: true
  });
  cy.visit('/m/all');
});

/**
 * API login (faster for test setup)
 */
Cypress.Commands.add('loginViaAPI', (userType) => {
  cy.getUser(userType).then(user => {
    const apiUrl = Cypress.env('API_URL') || Cypress.env('CYPRESS_API_URL');
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: {
        email: user.email,
        password: user.password,
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        // Store auth token and user data
        if (response.body.token) {
          window.localStorage.setItem('authToken', response.body.token);
        }
        if (response.body.user) {
          window.localStorage.setItem('user', JSON.stringify(response.body.user));
        }
        cy.log(`✅ API Login successful for ${user.email}`);
      } else {
        cy.log(`❌ API Login failed: ${response.status}`);
        throw new Error(`Login failed with status ${response.status}`);
      }
    });
  });
});

/**
 * Create a new test user dynamically (works in any environment)
 */
Cypress.Commands.add('createTestUser', () => {
  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substring(7);
  const env = Cypress.env('ENVIRONMENT') || 'staging';
  
  return {
    email: `test-${uniqueId}-${timestamp}@venmail-test.io`,
    password: `SecurePass${timestamp}!`,
    firstName: 'Test',
    lastName: 'User',
    username: `testuser${uniqueId}`,
    dateOfBirth: '1990-01-01',
    environment: env
  };
});

/**
 * Setup test data for the current environment
 */
Cypress.Commands.add('setupTestData', () => {
  const env = Cypress.env('ENVIRONMENT') || Cypress.env('environment') || 'staging';
  
  cy.log(`🔧 Setting up test data for: ${env.toUpperCase()}`);
  
  if (env === 'production') {
    cy.log('⚠️  Production environment - using read-only tests');
  } else {
    cy.log('✅ Non-production environment - full test suite enabled');
  }
});

/**
 * Clean up test data after tests
 */
Cypress.Commands.add('cleanupTestData', (email) => {
  const env = Cypress.env('ENVIRONMENT') || Cypress.env('environment') || 'staging';
  
  // Only cleanup in non-production environments
  if (env !== 'production') {
    cy.log(`🧹 Cleaning up test data: ${email}`);
    // Add your cleanup logic here
    // Example: cy.request('DELETE', `/api/users/${email}`)
  } else {
    cy.log('⚠️  Skipping cleanup in production');
  }
});

/**
 * Validate required environment variables are set
 */
Cypress.Commands.add('validateEnvironment', () => {
  const required = [
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'SALES_EMAIL',
    'SALES_PASSWORD',
    'NORMAL_USER_EMAIL',
    'NORMAL_USER_PASSWORD'
  ];

  const missing = required.filter(varName => !Cypress.env(varName));

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(', ')}\n\n` +
      `Please set these in:\n` +
      `  - Local: cypress.env.json\n` +
      `  - CI/CD: GitHub Secrets\n\n` +
      `See setup guide for details.`
    );
  }

  cy.log('✅ All required environment variables are set');
});

/**
 * Log current environment configuration (for debugging)
 */
Cypress.Commands.add('logEnvironment', () => {
  const env = Cypress.env('ENVIRONMENT') || Cypress.env('environment') || 'staging';
  const baseUrl = Cypress.config('baseUrl');
  const apiUrl = Cypress.env('API_URL') || Cypress.env('CYPRESS_API_URL');
  
  cy.log('📋 Current Environment Configuration:');
  cy.log(`  Environment: ${env}`);
  cy.log(`  Base URL: ${baseUrl}`);
  cy.log(`  API URL: ${apiUrl}`);
  cy.log(`  Admin Email: ${Cypress.env('ADMIN_EMAIL') ? '✅ Set' : '❌ Missing'}`);
  cy.log(`  Sales Email: ${Cypress.env('SALES_EMAIL') ? '✅ Set' : '❌ Missing'}`);
  cy.log(`  Normal User Email: ${Cypress.env('NORMAL_USER_EMAIL') ? '✅ Set' : '❌ Missing'}`);
});