// ========================================
// FILE: cypress/e2e/business-user/05-form-validation.cy.js
// ========================================

import BusinessRegistrationPage from '../../pages/BusinessRegistrationPage';
import { generateRandomDomainList, cleanupTestData, generateTestData } from './utils/testHelpers';

describe('Business Registration - Form Validation', () => {
    let businessRegPage;
    let userData;
    let testData;

    before(() => {
        cy.fixture('users').then((data) => {
            userData = data;
        });
    });

    beforeEach(() => {
        businessRegPage = new BusinessRegistrationPage();
        businessRegPage.visit();
        testData = generateTestData(userData);
    });

    afterEach(() => {
        cleanupTestData(testData);
    });

    it('should require all personal information fields', () => {
        businessRegPage.startSignUp();
        businessRegPage.selectBusinessAccount();

        businessRegPage.continueButton2().should('be.disabled');

        businessRegPage.firstNameField().type('John');
        businessRegPage.continueButton2().should('be.disabled');

        businessRegPage.lastNameField().type('Doe');
        businessRegPage.continueButton2().should('be.disabled');

        businessRegPage.emailField().type(testData.email);
        businessRegPage.continueButton2().should('not.be.disabled');
    });

    it('should require company name and terms agreement', () => {
        const domains = generateRandomDomainList(10);
        cy.log('🌐 Testing with domains:', domains.join(', '));

        businessRegPage.startSignUp();
        businessRegPage.selectBusinessAccount();
        businessRegPage.enterPersonalDetails(
            testData.firstName,
            testData.lastName,
            testData.email
        );
        businessRegPage.selectDomainOption('existing');
        businessRegPage.checkDomainWithRetry(domains, 10);
        businessRegPage.createBusinessPassword(testData.password);

        businessRegPage.continueButton().should('be.disabled');

        businessRegPage.organizationField().type(testData.companyName);
        businessRegPage.continueButton().should('be.disabled');

        businessRegPage.termsCheckbox().check();
        businessRegPage.continueButton().should('not.be.disabled');
    });

    it('should validate password requirements', () => {
        const domains = generateRandomDomainList(10);
        cy.log('🌐 Testing with domains:', domains.join(', '));

        businessRegPage.startSignUp();
        businessRegPage.selectBusinessAccount();
        businessRegPage.enterPersonalDetails(
            testData.firstName,
            testData.lastName,
            testData.email
        );
        businessRegPage.selectDomainOption('existing');
        businessRegPage.checkDomainWithRetry(domains, 10);

        businessRegPage.passwordField().type('weak');
        cy.contains(/password/i).should('be.visible');

        businessRegPage.passwordField().clear().type(testData.password);
        businessRegPage.continueButton().should('not.be.disabled');
    });
});