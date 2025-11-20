import BasePage from './BasePage';

class RegistrationPage extends BasePage {
    // Selectors
    signUpButton() {
        return cy.get('.text-center > .w-full');
    }

    personalAccount() {
        return cy.get('#personal');
    }

    businessAccount() {
        return cy.get('#business');
    }

    continueButton1() {
        return cy.get('.space-y-6 > .bg-primary-600');
    }

    firstNameField() {
        return cy.get('#first_name');
    }

    lastNameField() {
        return cy.get('#last_name');
    }

    emailField() {
        return cy.get('#email');
    }

    continueButton2() {
        return cy.get('.space-y-4 > .flex');
    }

    freeBilling() {
        return cy.get('#free');
    }

    continueButton3() {
        return cy.get('.space-y-6 > .bg-primary-600');
    }

    usernameField() {
        return cy.get('#username');
    }

    continueButton4() {
        return cy.get('.space-y-4 > .justify-center');
    }

    passwordField() {
        return cy.get('#password');
    }

    continueButton5() {
        return cy.get('.space-y-4 > .justify-center');
    }

    dateOfBirthField() {
        return cy.get('#date_of_birth');
    }

    termsCheckbox() {
        return cy.get('#terms-checkbox');
    }

    submitButton() {
        return cy.get('.disabled\\:opacity-50');
    }

    // Methods
    visit() {
        super.visit('/login');
        this.waitForPageLoad();
    }

    startSignUp() {
        this.signUpButton().click();
        cy.wait(2000);
    }

    selectPersonalAccount() {
        this.personalAccount().click();
        this.continueButton1().click();
        cy.wait(2000);
    }

    selectBusinessAccount() {
        this.businessAccount().click();
        this.continueButton1().click();
        cy.wait(2000);
    }

    enterPersonalDetails(firstName, lastName, email) {
        this.firstNameField().clear().type(firstName);
        this.lastNameField().clear().type(lastName);
        this.emailField().clear().type(email);
        this.continueButton2().click();
        cy.wait(2000);
    }

    selectFreeBilling() {
        this.freeBilling().click();
        this.continueButton3().click();
        cy.wait(2000);
    }

    enterUsername(username) {
        this.usernameField().clear().type(username);
        this.continueButton4().click();
        cy.wait(5000); // Wait for username validation
    }

    enterPassword(password) {
        this.passwordField().clear().type(password);
        this.continueButton5().click();
        cy.wait(2000);
    }

    enterDateOfBirth(dateOfBirth) {
        this.dateOfBirthField().type(dateOfBirth);
        this.termsCheckbox().check();
        this.submitButton().click();
        cy.wait(5000);
    }

    // Complete registration flow
    completeRegistration(userData) {
        this.startSignUp();
        this.selectPersonalAccount();
        this.enterPersonalDetails(userData.firstName, userData.lastName, userData.email);
        this.selectFreeBilling();
        this.enterUsername(userData.username);
        this.enterPassword(userData.password);
        this.enterDateOfBirth(userData.dateOfBirth);
    }

    verifyRegistrationSuccess() {
        cy.url().should('include', '/all', { timeout: 20000 });
    }

    verifyErrorMessage(expectedMessage) {
        cy.contains(expectedMessage).should('be.visible');
    }
}

export default RegistrationPage;