// cypress/e2e/login.cy.js - Secure multi-environment login tests
import LoginPage from "../../pages/LoginPage";

describe('Login Page - Positive and Negative Tests', () => {
  const loginPage = new LoginPage();

  before(() => {
    // Validate environment variables are set before running tests
    cy.validateEnvironment();
    cy.logEnvironment();
  });

  beforeEach(() => {
    // Setup test data for current environment
    cy.setupTestData();
    loginPage.visit();
  });

  // POSITIVE TEST - Successful Login
  it('should successfully login with valid credentials', () => {
    cy.getUser('normalUser').then((user) => {
      loginPage.login(user.email, user.password);
      cy.url({ timeout: 20000 }).should('include', '/m/all');
      
      // Verify user is logged in
      cy.log(`✅ Successfully logged in as ${user.email}`);
    });
  });

  // NEGATIVE TEST - Invalid Email (Email doesn't exist)
  it('should show error for non-existent email', () => {
    const timestamp = Date.now();
    const fakeEmail = `nonexistent-${timestamp}@test-${Math.random().toString(36).substring(7)}.com`;

    loginPage.usernameField().clear().type(fakeEmail);
    loginPage.continueButton().click();
    
    cy.wait(2000);
    
    loginPage.verifyErrorMessage('No account found with this email address');
    loginPage.passwordField().should('not.exist');
    
    cy.log(`✅ Correctly rejected non-existent email: ${fakeEmail}`);
  });

  // NEGATIVE TEST - Valid Email but Wrong Password
  it('should show error for incorrect password', () => {
    cy.getUser('normalUser').then((user) => {
      const wrongPassword = `WrongPass${Date.now()}!`;
      
      loginPage.usernameField().clear().type(user.email);
      loginPage.continueButton().click();
      
      cy.wait(2000);
      
      loginPage.passwordField().should('be.visible');
      loginPage.passwordField().clear().type(wrongPassword);
      loginPage.loginButton().click();
      
      cy.wait(1000);
      
      loginPage.verifyErrorMessage('The provided password is incorrect');
      
      cy.log(`✅ Correctly rejected wrong password for ${user.email}`);
    });
  });

  it('should show error for invalid email format', () => {
    const invalidEmail = 'invalidemail';
    
    loginPage.usernameField().clear().type(invalidEmail);
    loginPage.continueButton().click();

    loginPage.usernameField()
      .invoke('prop', 'validationMessage')
      .should('contain', "Please include an '@'");
    
    cy.log(`✅ Correctly rejected invalid email format: ${invalidEmail}`);
  });
});