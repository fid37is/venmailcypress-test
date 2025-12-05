import BasePage from './BasePage';

class ForgotPasswordPage extends BasePage {
    // Define selectors
    forgotPasswordLink() {
        return cy.get('a[href*="forgot-password"], button').contains(/Forgotten your password?|Forgot password/i);
    }

    emailField() {
        return cy.get('#email');
    }

    resetPasswordButton() {
        return cy.get('.bg-primary-600');
    }

    successMessage() {
        // Generic selector for success messages - don't hardcode text here
        return cy.get('.text-green-500, .text-success, [class*="success"]').first();
    }

    errorMessage() {
        return cy.get('.text-red-500 > p');
    }

    backToLoginLink() {
        return cy.get('a, button').contains(/Back|Return to login/i);
    }

    // Methods to interact with the page
    visitFromLogin() {
        super.visit('/login');
        this.waitForPageLoad();
    }

    clickForgotPassword() {
        this.forgotPasswordLink().click();
        cy.wait(2000);
    }

    enterEmail(email) {
        this.emailField().clear().type(email);
    }

    clickResetPassword() {
        this.resetPasswordButton().click();
        cy.wait(3000);
    }

    requestPasswordReset(email) {
        this.enterEmail(email);
        this.clickResetPassword();
    }

    verifySuccessMessage(expectedMessage) {
        // Use contains to find the success message anywhere on the page
        cy.contains(expectedMessage).should('be.visible');
    }

    verifyErrorMessage(expectedMessage) {
        this.errorMessage().should('be.visible').and('contain', expectedMessage);
    }

    verifyForgotPasswordPage() {
        cy.url().should('include', '/forgot-password');
        this.emailField().should('be.visible');
    }

    clickBackToLogin() {
        this.backToLoginLink().click();
        cy.wait(2000);
    }
}

export default ForgotPasswordPage;