import BasePage from './BasePage';

class ForgotPasswordPage extends BasePage {
    // Define selectors
    forgotPasswordLink() {
        return cy.contains('Forgotten your password?');
    }

    emailField() {
        return cy.get('#email');
    }

    resetPasswordButton() {
        return cy.get('.bg-primary-600');
    }

    successMessage() {
        return cy.contains('Please wait before retrying.');
    }

    errorMessage() {
        return cy.get('.text-red-500 > p');
    }

    backToLoginLink() {
        return cy.contains('Back');
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
        this.successMessage().should('be.visible').and('contain', expectedMessage);
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