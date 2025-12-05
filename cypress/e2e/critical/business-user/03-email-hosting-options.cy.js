// ========================================
// FILE: cypress/e2e/business-user/03-email-hosting-options.cy.js
// ========================================

import BusinessRegistrationPage from '../../pages/BusinessRegistrationPage';
import { generateRandomDomainList, cleanupTestData, generateTestData } from './utils/testHelpers';

describe('Business Registration - Email Hosting Options', () => {
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

        // Navigate to email hosting selection
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
        businessRegPage.enterCompanyInfo(testData.companyName, true);
    });

    afterEach(() => {
        cleanupTestData(testData);
    });

    it('should display both hosting options', () => {
        cy.contains('Choose how you want to host email data').should('be.visible');
        businessRegPage.selfHostedOption().should('be.visible');
        businessRegPage.cloudHostedOption().should('be.visible');
    });

    it('should select self-hosted option', () => {
        businessRegPage.selectEmailHosting('self');
        businessRegPage.verifyPlanSelectionPage();
    });

    it('should select cloud-hosted option', () => {
        businessRegPage.selectEmailHosting('cloud');
        businessRegPage.verifyPlanSelectionPage();
    });
});
