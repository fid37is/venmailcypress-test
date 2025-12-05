// cypress/support/commands.js - Add environment-aware user loading
import LoginPage from "../pages/LoginPage";

Cypress.Commands.add('getUser', (userType) => {
  const env = Cypress.env('environment') || 'staging';
  return cy.fixture(`users/${env}`).then((users) => users[userType]);
});

// Get users from environment-specific fixture
Cypress.Commands.add('getUsers', () => {
  const env = Cypress.env('environment') || 'staging';
  return cy.fixture(`users/${env}`);
});

// Login with session caching - environment aware
Cypress.Commands.add('loginAsUser', (email, password) => {
  cy.session(
    [email, password],
    () => {
      const loginPage = new LoginPage();
      loginPage.visit();
      loginPage.login(email, password);
      loginPage.verifyDashboard();
    },
    {
      validate() {
        cy.getCookie('session').should('exist');
      }
    }
  );
  // Visit dashboard after session restore
  cy.visit('/m/all');
});

// Admin login with session - environment aware
Cypress.Commands.add('adminLogin', () => {
  cy.session('admin-session', () => {
    cy.getUser('existingAdminUser').then(user => {
      cy.visit('/login');
      const loginPage = new LoginPage();
      loginPage.login(user.email, user.password);
      cy.contains('Welcome to your Venmail', { timeout: 30000 }).should('be.visible');
    });
  });
  cy.visit('/m/all'); // Visit after session restore
});

// Normal user login with session - environment aware
Cypress.Commands.add('normalUserLogin', () => {
  cy.session('normal-user-session', () => {
    cy.getUser('normalUser').then(user => {
      cy.visit('/login');
      const loginPage = new LoginPage();
      loginPage.login(user.email, user.password);
      cy.url({ timeout: 30000 }).should('include', '/m/all');
    });
  });
  cy.visit('/m/all'); // Visit after session restore
});

// Sales user login with session - environment aware
Cypress.Commands.add('salesUserLogin', () => {
  cy.session('sales-user-session', () => {
    cy.getUser('existingSalesUser').then(user => {
      cy.visit('/login');
      const loginPage = new LoginPage();
      loginPage.login(user.email, user.password);
      cy.url({ timeout: 30000 }).should('include', '/m/all');
    });
  });
  cy.visit('/m/all'); // Visit after session restore
});

// Create a new test user dynamically (works in any environment)
Cypress.Commands.add('createTestUser', () => {
  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substring(7);
  
  return {
    email: `test-${uniqueId}-${timestamp}@venmail-test.io`,
    password: `SecurePass${timestamp}!`,
    firstName: 'Test',
    lastName: 'User',
    username: `testuser${uniqueId}`,
    dateOfBirth: '1990-01-01'
  };
});

// Setup test data for the current environment
Cypress.Commands.add('setupTestData', () => {
  const env = Cypress.env('environment') || 'staging';
  
  cy.log(`Setting up test data for: ${env}`);
  
  // You can make API calls here to create test data
  // Or use existing users based on environment
  if (env === 'production') {
    // Use read-only tests or minimal data creation
    cy.log('Production environment - using read-only tests');
  } else {
    // Full test data creation for staging
    cy.log('Staging environment - full test suite');
  }
});

// Clean up test data after tests
Cypress.Commands.add('cleanupTestData', (email) => {
  const env = Cypress.env('environment') || 'staging';
  
  // Only cleanup in non-production environments
  if (env !== 'production') {
    cy.log(`Cleaning up test data: ${email}`);
    // Add your cleanup logic here
  }
});
