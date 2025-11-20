import BasePage from './BasePage';

class LoginPage extends BasePage {
    // Define selectors
    usernameField() {
        return cy.get('#email');
    }

    continueButton() {
        return cy.get('.bg-primary-600');
    }

    passwordField() {
        return cy.get('#password'); 
    }

    loginButton() {
        return cy.get('.bg-primary-600');
    }

    errorMessage() {
        return cy.get('.text-red-500 > p');
    }

    // Methods to interact with the page
    visit() {
        super.visit('/login');
        this.waitForPageLoad();
    }

    enterEmail(email) {
        this.usernameField().clear().type(email);
        this.continueButton().click();
        cy.wait(2000); // Wait for transition
    }

    enterPassword(password) {
        this.passwordField().clear().type(password);
    }

    clickLogin() {
        this.loginButton().click();
        cy.wait(15000); // Wait for login process
    }

    // Combined login method
    login(email, password) {
        this.enterEmail(email);
        this.enterPassword(password);
        this.clickLogin();
    }

    verifyErrorMessage(expectedMessage) {
        this.errorMessage().should('be.visible').and('contain', expectedMessage);
    }

    verifyDashboard() {
        cy.url().should('include', 'm/all', { timeout: 20000 });
    }

    verifyLoginPage() {
        cy.url().should('include', '/login');
        this.continueButton().should('be.visible');
    }
}

export default LoginPage;