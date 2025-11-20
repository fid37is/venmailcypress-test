// cypress/e2e/login-tests.cy.js

import LoginPage from "../../pages/LoginPage";

describe('Login Page - Positive and Negative Tests', () => {
  const loginPage = new LoginPage();
  let users;

  before(() => {
    cy.fixture('users').then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    loginPage.visit();
  });

  // POSITIVE TEST - Successful Login
  it('should successfully login with valid credentials', () => {
    loginPage.login(users.normalUser.email, users.normalUser.password);
    cy.url({ timeout: 20000 }).should('include', '/m/all');
  });

  // NEGATIVE TEST - Invalid Email (Email doesn't exist)
  it('should show error for non-existent email', () => {
    loginPage.usernameField().clear().type('nonexistent@test.com');
    loginPage.continueButton().click();
    cy.wait(2000);
    loginPage.verifyErrorMessage('No account found with this email address');
    loginPage.passwordField().should('not.exist');
  });

  // NEGATIVE TEST - Valid Email but Wrong Password
  it('should show error for incorrect password', () => {
    loginPage.usernameField().clear().type(users.normalUser.email);
    loginPage.continueButton().click();
    cy.wait(2000);
    loginPage.passwordField().clear().type('WrongPassword123!');
    loginPage.loginButton().click();
    cy.wait(15000);
    loginPage.verifyErrorMessage('The provided password is incorrect');
  });

  // NEGATIVE TEST - Empty Password
  it('should disable login button with empty password', () => {
    loginPage.usernameField().clear().type(users.normalUser.email);
    loginPage.continueButton().click();
    cy.wait(2000);
    loginPage.passwordField().should('be.visible');
    loginPage.passwordField().clear();
    loginPage.loginButton().should('be.disabled');
  });
})