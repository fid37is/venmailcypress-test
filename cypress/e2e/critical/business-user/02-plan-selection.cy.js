// ========================================
// FILE: cypress/e2e/business-user/02-plan-selection.cy.js
// ========================================

import BusinessRegistrationPage from '../../pages/BusinessRegistrationPage';
import { generateRandomDomainList, cleanupTestData, generateTestData } from './utils/testHelpers';

describe('Business Registration - Plan Selection', () => {
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

        // Navigate to plan selection page
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
        businessRegPage.selectEmailHosting('self');
    });

    afterEach(() => {
        cleanupTestData(testData);
    });

    it('should display all plan options correctly', () => {
        businessRegPage.verifyPlanSelectionPage();
    });

    it('should select free Solo Founder plan and see welcome message', () => {
        businessRegPage.verifyPlanSelectionPage();
        businessRegPage.selectPlan(1);
        businessRegPage.verifyWelcomeMessage();
    });

    it('should select paid Startup plan and redirect to payment', () => {
        businessRegPage.verifyPlanSelectionPage();
        businessRegPage.selectPlan(2);
        businessRegPage.verifyPaymentPage();
    });

    it('should select paid Business plan and redirect to payment', () => {
        businessRegPage.verifyPlanSelectionPage();
        businessRegPage.selectPlan(3);
        businessRegPage.verifyPaymentPage();
    });

    it('should select Enterprise plan and redirect to payment', () => {
        businessRegPage.verifyPlanSelectionPage();
        businessRegPage.selectPlan(4);
        businessRegPage.verifyPaymentPage();
    });
});
