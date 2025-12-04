// ========================================
// ========================================
// FILE: cypress/e2e/business-user/01-complete-registration-flow.cy.js
// Copy this content to a new file
// ========================================
// ========================================

import BusinessRegistrationPage from '../../pages/BusinessRegistrationPage';
import { generateRandomDomain, generateRandomDomainList, cleanupTestData, generateTestData } from './utils/testHelpers';

describe('Business Registration - Complete Flow', () => {
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

    it.skip('should complete registration with existing domain and retry logic', () => {
        const domains = generateRandomDomainList(10);
        cy.log('🌐 Generated test domains:', domains.join(', '));

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
        businessRegPage.verifyPlanSelectionPage();
    });

    it.skip('should complete registration with new domain purchase flow', () => {
        const domain = generateRandomDomain();
        cy.log('🌐 Testing domain purchase with:', domain);

        businessRegPage.startSignUp();
        businessRegPage.selectBusinessAccount();
        businessRegPage.enterPersonalDetails(
            testData.firstName,
            testData.lastName,
            testData.email
        );
        businessRegPage.selectDomainOption('new');
        businessRegPage.enterAndCheckDomain(domain, 3000);
        
        cy.get('body').then(($body) => {
            const bodyText = $body.text();
            if (bodyText.includes('We found your domain')) {
                cy.log('✅ Domain available for purchase');
                businessRegPage.verifyDomainFound(domain);
                businessRegPage.domainContinueButton().click();
            } else if (bodyText.includes('This domain is not available for registration')) {
                cy.log('❌ Domain not available for purchase');
            }
        });

        businessRegPage.createBusinessPassword(testData.password);
        businessRegPage.enterCompanyInfo(testData.companyName, true);
        businessRegPage.selectEmailHosting('cloud');
        businessRegPage.verifyPlanSelectionPage();
    });
});

