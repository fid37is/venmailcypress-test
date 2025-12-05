// cypress/support/credentials.js
// This file handles secure credential loading from environment variables

/**
 * Load user credentials from environment variables
 * These are set in GitHub Actions secrets and accessed via CYPRESS_ prefix
 */
export const users = {
  existingAdminUser: {
    email: Cypress.env('ADMIN_EMAIL'),
    password: Cypress.env('ADMIN_PASSWORD'),
  },
  existingSalesUser: {
    email: Cypress.env('SALES_EMAIL'),
    password: Cypress.env('SALES_PASSWORD'),
  },
  normalUser: {
    email: Cypress.env('NORMAL_USER_EMAIL'),
    password: Cypress.env('NORMAL_USER_PASSWORD'),
    firstName: Cypress.env('NORMAL_USER_FIRSTNAME'),
    lastName: Cypress.env('NORMAL_USER_LASTNAME'),
  },
};

/**
 * Validate that all required credentials are set
 * Call this in your beforeEach or before hooks
 */
export const validateCredentials = () => {
  const requiredEnvVars = [
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'SALES_EMAIL',
    'SALES_PASSWORD',
    'NORMAL_USER_EMAIL',
    'NORMAL_USER_PASSWORD',
  ];

  const missing = requiredEnvVars.filter(varName => !Cypress.env(varName));

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please set these in GitHub Secrets or your local cypress.env.json file.'
    );
  }
};

/**
 * Helper function to get user by role
 */
export const getUser = (role) => {
  const userMap = {
    admin: users.existingAdminUser,
    sales: users.existingSalesUser,
    normal: users.normalUser,
  };

  const user = userMap[role];
  if (!user) {
    throw new Error(`Unknown user role: ${role}`);
  }

  return user;
};

// Export for use in tests
export default users;