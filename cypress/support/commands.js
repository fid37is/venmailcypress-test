// ***********************************************
// Custom Cypress Commands for Page Object Model
// ***********************************************

/**
 * AUTHENTICATION COMMANDS
 */

import LoginPage from '../pages/LoginPage';
import RegistrationPage from '../pages/RegistrationPage';
import EmailSendingPage from '../pages/EmailSendingPage';

/**
 * Login as user with session caching
 * Uses Cypress sessions to avoid repeated logins
 * @param {string} email - User email
 * @param {string} password - User password
 * 
 * Example: cy.loginAsUser('user@example.com', 'password123')
 */
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

/**
 * TEST DATA GENERATION COMMANDS
 */

/**
 * Generate unique email address for testing
 * Uses timestamp + random number to ensure uniqueness
 * @returns {string} Unique email address
 * 
 * Example: const email = cy.generateUniqueEmail()
 */
Cypress.Commands.add('generateUniqueEmail', () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `testuser${timestamp}${random}@yopmail.com`;
});

/**
 * Generate unique username for testing
 * @returns {string} Unique username
 * 
 * Example: const username = cy.generateUniqueUsername()
 */
Cypress.Commands.add('generateUniqueUsername', () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `user${timestamp}${random}`;
});

/**
 * Generate unique domain name for testing
 * @param {string} extension - Domain extension (default: 'com')
 * @returns {string} Unique domain name
 * 
 * Example: const domain = cy.generateUniqueDomain('org')
 */
Cypress.Commands.add('generateUniqueDomain', (extension = 'com') => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    return `test-${timestamp}-${randomId}.${extension}`;
});

/**
 * Generate complete test data object for business registration
 * @param {object} userData - Optional base user data from fixtures
 * @returns {object} Complete test data object
 * 
 * Example: const testData = cy.generateBusinessTestData(userData)
 */
Cypress.Commands.add('generateBusinessTestData', (userData = {}) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    
    return {
        email: `bizuser-${timestamp}-${randomId}@yopmail.com`,
        password: 'SecurePass123!',
        companyName: `Test Company ${timestamp}`,
        firstName: userData.firstName || 'Test',
        lastName: userData.lastName || 'User',
        uniqueDomain: `testbiz-${timestamp}-${randomId}.com`,
        timestamp,
        randomId
    };
});

/**
 * CLEANUP COMMANDS
 */

/**
 * Clean up test data after test execution
 * Sends request to backend cleanup endpoint
 * @param {object} testData - Test data object containing email, domain, etc.
 * 
 * Example: cy.cleanupTestData(testData)
 */
Cypress.Commands.add('cleanupTestData', (testData) => {
    if (!testData || !testData.email) {
        cy.log('⚠️ No test data to cleanup');
        return;
    }
    
    cy.log(`🧹 Cleaning up: ${testData.email}`);
    
    cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/api/test/cleanup`,
        body: {
            email: testData.email,
            domain: testData.uniqueDomain,
            companyName: testData.companyName
        },
        failOnStatusCode: false, // Don't fail test if cleanup fails
        timeout: 15000
    }).then((response) => {
        if (response.status === 200) {
            cy.log('✅ Cleanup successful:', JSON.stringify(response.body));
        } else {
            cy.log(`⚠️ Cleanup response (${response.status}):`, response.body);
        }
    }).catch((error) => {
        // Log error but don't fail the test
        cy.log('⚠️ Cleanup error (non-critical):', error.message);
    });
});

/**
 * UTILITY COMMANDS
 */

/**
 * Wait with a log message
 * Provides better visibility in test logs
 * @param {number} ms - Milliseconds to wait
 * @param {string} message - Optional message to display
 * 
 * Example: cy.waitWithLog(3000, 'waiting for API response')
 */
Cypress.Commands.add('waitWithLog', (ms, message = '') => {
    cy.log(`⏳ Waiting ${ms}ms${message ? ': ' + message : ''}`);
    cy.wait(ms);
});

/**
 * Check if element exists without failing test
 * @param {string} selector - CSS selector
 * @returns {boolean} True if element exists
 * 
 * Example: cy.elementExists('.my-element').then(exists => { ... })
 */
Cypress.Commands.add('elementExists', (selector) => {
    return cy.get('body').then($body => {
        return $body.find(selector).length > 0;
    });
});

/**
 * Safe click - waits for element to be visible and enabled
 * @param {string} selector - CSS selector
 * @param {object} options - Cypress click options
 * 
 * Example: cy.safeClick('.submit-button')
 */
Cypress.Commands.add('safeClick', (selector, options = {}) => {
    cy.get(selector)
        .should('be.visible')
        .should('not.be.disabled')
        .click(options);
});

/**
 * Type with clear - clears field before typing
 * @param {string} selector - CSS selector
 * @param {string} text - Text to type
 * 
 * Example: cy.typeWithClear('#email', 'test@example.com')
 */
Cypress.Commands.add('typeWithClear', (selector, text) => {
    cy.get(selector)
        .should('be.visible')
        .clear()
        .type(text);
});

/**
 * Wait for API request to complete
 * @param {string} alias - Intercept alias name
 * @param {number} timeout - Optional timeout in ms
 * 
 * Example: cy.waitForAPI('@loginRequest')
 */
Cypress.Commands.add('waitForAPI', (alias, timeout = 10000) => {
    cy.wait(alias, { timeout }).then((interception) => {
        cy.log(`✅ API call completed: ${interception.request.url}`);
        return interception;
    });
});

/**
 * VALIDATION COMMANDS
 */

/**
 * Verify toast/notification message appears
 * @param {string} message - Expected message text
 * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
 * 
 * Example: cy.verifyToast('Registration successful', 'success')
 */
Cypress.Commands.add('verifyToast', (message, type = 'success') => {
    cy.contains(message, { timeout: 10000 })
        .should('be.visible');
    cy.log(`✅ Toast verified: ${type} - "${message}"`);
});

/**
 * Verify URL contains specific path
 * @param {string|RegExp} path - Expected path or pattern
 * 
 * Example: cy.verifyURL('/dashboard')
 */
Cypress.Commands.add('verifyURL', (path) => {
    cy.url().should('match', new RegExp(path));
    cy.log(`✅ URL verified: ${path}`);
});

/**
 * DEBUGGING COMMANDS
 */

/**
 * Take screenshot with custom name
 * @param {string} name - Screenshot name
 * 
 * Example: cy.screenshot('after-login')
 */
Cypress.Commands.add('takeScreenshot', (name) => {
    const timestamp = Date.now();
    cy.screenshot(`${name}-${timestamp}`);
    cy.log(`📸 Screenshot taken: ${name}`);
});

/**
 * Log test context information
 * @param {string} context - Context description
 * @param {object} data - Data to log
 * 
 * Example: cy.logContext('Test Data', testData)
 */
Cypress.Commands.add('logContext', (context, data) => {
    cy.log(`📋 ${context}:`);
    cy.log(JSON.stringify(data, null, 2));
});

Cypress.Commands.add('adminLogin', () => {
  cy.session('admin-session', () => {
    cy.fixture('users').then(users => {
      cy.visit('/login');
      const loginPage = new LoginPage();
      loginPage.login(users.existinAdmingUser.email, users.existinAdmingUser.password);
      cy.contains('Welcome to your Venmail', { timeout: 30000 }).should('be.visible');
    });
  });
});

Cypress.Commands.add('normalUserLogin', () => {
  cy.session('normal-user-session', () => {
    cy.fixture('users').then(users => {
      const user = users.normalUser;
      cy.visit('/login');
      const loginPage = new LoginPage();
      loginPage.login(user.email, user.password);
      cy.url({ timeout: 30000 }).should('include', '/m/all');
    });
  });
});