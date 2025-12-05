// cypress/e2e/login.cy.js - Fixed environment-agnostic login tests
import LoginPage from "../../pages/LoginPage";

describe('Login Page - Positive and Negative Tests', () => {
  const loginPage = new LoginPage();

  beforeEach(() => {
    loginPage.visit();
  });

  // POSITIVE TEST - Successful Login
  it('should successfully login with valid credentials', () => {
    cy.getUser('normalUser').then((user) => {
      loginPage.login(user.email, user.password);
      cy.url({ timeout: 20000 }).should('include', '/m/all');
    });
  });

  // NEGATIVE TEST - Invalid Email (Email doesn't exist)
  it('should show error for non-existent email', () => {
    const fakeEmail = `nonexistent-${Date.now()}@test.com`;

    loginPage.usernameField().clear().type(fakeEmail);
    loginPage.continueButton().click();
    cy.wait(2000);
    loginPage.verifyErrorMessage('No account found with this email address');
    loginPage.passwordField().should('not.exist');
  });

  // NEGATIVE TEST - Valid Email but Wrong Password
  it('should show error for incorrect password', () => {
    cy.getUser('normalUser').then((user) => {
      loginPage.usernameField().clear().type(user.email);
      loginPage.continueButton().click();
      cy.wait(2000);
      loginPage.passwordField().clear().type('WrongPassword123!');
      loginPage.loginButton().click();
      cy.wait(1000);
      loginPage.verifyErrorMessage('The provided password is incorrect');
    });
  });

  it('should show error for invalid email format', () => {
    loginPage.usernameField().clear().type('invalidemail');
    loginPage.continueButton().click();

    loginPage.usernameField()
      .invoke('prop', 'validationMessage')
      .should('contain', "Please include an '@'");
  });

});

