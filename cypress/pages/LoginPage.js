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

    // Login with session caching
    loginWithSession(email, password) {
        cy.session(
            [email, password], // Unique identifier for this session
            () => {
                // This code only runs once per unique email/password combination
                this.visit();
                this.enterEmail(email);
                this.enterPassword(password);
                this.clickLogin();
                this.verifyDashboard();
            },
            {
                validate() {
                    // Optional: Validate that the session is still valid
                    // You can check for a cookie, localStorage item, or make an API call
                    cy.getCookie('auth-token').should('exist');
                },
                cacheAcrossSpecs: true // Persist session across different spec files
            }
        );
        
        // After session is restored, visit the dashboard
        cy.visit('/m/all');
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