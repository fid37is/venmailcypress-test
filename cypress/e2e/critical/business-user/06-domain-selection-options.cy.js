// ========================================
// FILE: cypress/e2e/business-user/06-domain-selection-options.cy.js
// ========================================

import BusinessRegistrationPage from '../../pages/BusinessRegistrationPage';
import { cleanupTestData, generateTestData } from './utils/testHelpers';

describe('Business Registration - Domain Selection Options', () => {
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

        businessRegPage.startSignUp();
        businessRegPage.selectBusinessAccount();
        businessRegPage.enterPersonalDetails(
            testData.firstName,
            testData.lastName,
            testData.email
        );
    });

    afterEach(() => {
        cleanupTestData(testData);
    });

    it('should display both domain selection options', () => {
        businessRegPage.existingDomainButton().should('be.visible');
        businessRegPage.buyNewDomainButton().should('be.visible');
        cy.contains('Use my existing domain').should('be.visible');
        cy.contains('Connect a domain you already own').should('be.visible');
        cy.contains('Buy a new domain').should('be.visible');
        cy.contains('Free domain for business plans or higher').should('be.visible');
    });

    it('should allow selecting existing domain option', () => {
        businessRegPage.selectDomainOption('existing');
        businessRegPage.domainField().should('be.visible');
    });

    it('should allow selecting buy new domain option', () => {
        businessRegPage.selectDomainOption('new');
        businessRegPage.domainField().should('be.visible');
    });
});