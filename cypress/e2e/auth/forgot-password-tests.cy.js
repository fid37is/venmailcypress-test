// cypress/e2e/forgot-password-tests.cy.js

import ForgotPasswordPage from "../../pages/ForgotPasswordPage";

describe('Forgot Password - Positive and Negative Tests', () => {
  const forgotPasswordPage = new ForgotPasswordPage();
  let users;

  before(() => {
    cy.fixture('users').then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    forgotPasswordPage.visitFromLogin();
  });

  // POSITIVE TEST - Access Forgot Password Page
  it('should navigate to forgot password page from login', () => {
    forgotPasswordPage.clickForgotPassword();
    forgotPasswordPage.verifyForgotPasswordPage();
  });

  // POSITIVE TEST - Valid Email Reset Request
  it('should send password reset email for valid user', () => {
    forgotPasswordPage.clickForgotPassword();
    forgotPasswordPage.requestPasswordReset(users.normalUser.email);
    forgotPasswordPage.verifySuccessMessage('Please wait before retrying.');
  });

  // NEGATIVE TEST - Invalid Email Format (triggers browser validation)
  it('should trigger browser validation for invalid email format', () => {
    forgotPasswordPage.clickForgotPassword();
    forgotPasswordPage.emailField().clear().type('notanemail');
    forgotPasswordPage.resetPasswordButton().click();
    // Browser validation prevents form submission with invalid email
    forgotPasswordPage.emailField().then($input => {
      expect($input[0].validationMessage).to.exist;
    });
  });

  // NEGATIVE TEST - Non-existent Email
  it('should show error for non-existent email', () => {
    forgotPasswordPage.clickForgotPassword();
    forgotPasswordPage.requestPasswordReset('nonexistent@test.com');
    forgotPasswordPage.verifyErrorMessage("We can't find a user with that email address.");
  });

  // NEGATIVE TEST - Empty Email Field (button still clickable)
  it('should show error when submitting empty email', () => {
    forgotPasswordPage.clickForgotPassword();
    forgotPasswordPage.emailField().clear();
    forgotPasswordPage.resetPasswordButton().should('not.be.disabled');
    forgotPasswordPage.clickResetPassword();
    forgotPasswordPage.verifyErrorMessage('The email field is required.');
  });

  // POSITIVE TEST - Navigate Back to Login
  it('should navigate back to login page', () => {
    forgotPasswordPage.clickForgotPassword();
    forgotPasswordPage.clickBackToLogin();
    cy.url().should('include', '/login');
  });
});