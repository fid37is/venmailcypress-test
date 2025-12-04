// ========================================
// FILE: cypress/e2e/business-user/04-domain-validation.cy.js
// ========================================

import BusinessRegistrationPage from '../../pages/BusinessRegistrationPage';
import { generateRandomDomain, cleanupTestData, generateTestData } from './utils/testHelpers';

describe('Business Registration - Domain Validation', () => {
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

    it('should show error when domain not found in provider', () => {
        const randomDomain = generateRandomDomain();
        cy.log('🔍 Testing domain not in provider:', randomDomain);

        businessRegPage.selectDomainOption('existing');
        businessRegPage.enterAndCheckDomain(randomDomain, 3000);
        
        cy.get('body').then(($body) => {
            const bodyText = $body.text();
            cy.log('Response:', bodyText);
            
            expect(bodyText).to.satisfy((text) => 
                text.includes('not available') || 
                text.includes('not found') ||
                text.includes('error') ||
                text.includes('invalid')
            );
        });
    });

    it('should handle invalid domain format', () => {
        const invalidDomain = 'not-a-valid-domain';
        cy.log('🚫 Testing invalid domain:', invalidDomain);

        businessRegPage.selectDomainOption('existing');
        businessRegPage.enterAndCheckDomain(invalidDomain, 3000);
        
        cy.get('body').then(($body) => {
            const bodyText = $body.text();
            cy.log('Response:', bodyText);
            
            expect(bodyText).to.satisfy((text) => 
                text.includes('invalid') || 
                text.includes('error') ||
                text.includes('not found')
            );
        });
    });
});