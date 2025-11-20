import BusinessRegistrationPage from '../../pages/BusinessRegistrationPage';

describe('Business User Registration', () => {
    let businessRegPage;
    let userData;
    let testData;

    // Word lists for three-word domain generation
    const adjectives = [
        'blue', 'red', 'green', 'happy', 'swift', 'bright', 'calm', 'bold',
        'wise', 'quick', 'smart', 'cool', 'warm', 'fresh', 'clear', 'pure',
        'silver', 'golden', 'wild', 'gentle', 'strong', 'brave', 'proud', 'noble'
    ];

    const nouns1 = [
        'ocean', 'mountain', 'river', 'forest', 'cloud', 'star', 'moon', 'sun',
        'wind', 'stone', 'tree', 'flower', 'bird', 'fish', 'wave', 'sky',
        'cocoon', 'valley', 'peak', 'meadow', 'spring', 'autumn', 'winter', 'summer'
    ];

    const nouns2 = [
        'tiger', 'eagle', 'wolf', 'bear', 'lion', 'hawk', 'fox', 'deer',
        'rabbit', 'goat', 'horse', 'dragon', 'phoenix', 'whale', 'dolphin', 'owl',
        'panda', 'koala', 'zebra', 'giraffe', 'elephant', 'rhino', 'leopard', 'cheetah'
    ];

    before(() => {
        cy.fixture('users').then((data) => {
            userData = data;
        });
    });

    beforeEach(() => {
        businessRegPage = new BusinessRegistrationPage();
        businessRegPage.visit();
        
        // Generate unique test data for each test
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 9);
        
        testData = {
            email: `bizuser-${timestamp}-${randomId}@yopmail.com`,
            password: 'SecurePass123!',
            companyName: `Test Company ${timestamp}`,
            firstName: userData.newUser.firstName,
            lastName: userData.newUser.lastName,
            // Generate random domain that WON'T be found (for most tests)
            uniqueDomain: generateRandomDomain()
        };
    });

    afterEach(() => {
        // Cleanup: Delete test data created during the test
        if (testData && testData.email) {
            cy.log(`🧹 Cleaning up test data for: ${testData.email}`);
            
            cy.request({
                method: 'POST',
                url: `${Cypress.env('apiUrl')}/api/test/cleanup`,
                body: {
                    email: testData.email,
                    domain: testData.uniqueDomain,
                    companyName: testData.companyName
                },
                failOnStatusCode: false,
                timeout: 15000
            }).then((response) => {
                if (response.status === 200) {
                    cy.log('✅ Cleanup successful:', JSON.stringify(response.body));
                } else {
                    cy.log(`⚠️ Cleanup response (${response.status}):`, response.body);
                }
            }).catch((error) => {
                cy.log('⚠️ Cleanup error (non-critical):', error.message);
            });
        }
    });

    /**
     * Generate a random domain that likely won't be found in provider
     * These are random domains for testing "domain not found" scenarios
     */
    const generateRandomDomain = (extension = 'com') => {
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun1 = nouns1[Math.floor(Math.random() * nouns1.length)];
        const noun2 = nouns2[Math.floor(Math.random() * nouns2.length)];
        
        return `${adjective}${noun1}${noun2}.${extension}`;
    };

    /**
     * Generate list of random domains (will likely fail checks)
     */
    const generateRandomDomainList = (count = 5) => {
        const extensions = ['com', 'org', 'net', 'io', 'co'];
        const domains = new Set();
        
        let attempts = 0;
        const maxAttempts = count * 10;
        
        while (domains.size < count && attempts < maxAttempts) {
            const ext = extensions[domains.size % extensions.length];
            const domain = generateRandomDomain(ext);
            domains.add(domain);
            attempts++;
        }
        
        return Array.from(domains);
    };

    describe('Complete Business Registration Flow', () => {
        it('should handle domain check with retry and complete registration', () => {
            // Generate multiple random domains - system will check provider
            // Most will fail, retry logic will keep trying until one works or max retries
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
            
            // This will try domains until one is found in provider OR max retries reached
            // For testing, we expect most to fail the provider check
            businessRegPage.checkDomainWithRetry(domains, 10);
            
            businessRegPage.createBusinessPassword(testData.password);
            businessRegPage.enterCompanyInfo(testData.companyName, true);
            businessRegPage.selectEmailHosting('self');
            businessRegPage.verifyPlanSelectionPage();
        });

        it('should complete registration with new domain purchase flow', () => {
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
            
            // For "buy new domain", system checks if domain is available for purchase
            cy.get('body').then(($body) => {
                const bodyText = $body.text();
                if (bodyText.includes('We found your domain')) {
                    cy.log('✅ Domain available for purchase');
                    businessRegPage.verifyDomainFound(domain);
                    businessRegPage.domainContinueButton().click();
                } else if (bodyText.includes('This domain is not available for registration')) {
                    cy.log('❌ Domain not available for purchase, test will retry');
                    // In real scenario, might need to retry with different domain
                }
            });

            businessRegPage.createBusinessPassword(testData.password);
            businessRegPage.enterCompanyInfo(testData.companyName, true);
            businessRegPage.selectEmailHosting('cloud');
            businessRegPage.verifyPlanSelectionPage();
        });
    });

    describe('Plan Selection', () => {
        beforeEach(() => {
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

    describe('Email Hosting Options', () => {
        beforeEach(() => {
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

    describe('Domain Availability Validation', () => {
        beforeEach(() => {
            businessRegPage.startSignUp();
            businessRegPage.selectBusinessAccount();
            businessRegPage.enterPersonalDetails(
                testData.firstName,
                testData.lastName,
                testData.email
            );
        });

        it('should show error when domain not found in provider', () => {
            // Random domain that won't be in user's provider
            const randomDomain = generateRandomDomain();
            cy.log('🔍 Testing domain not in provider:', randomDomain);

            businessRegPage.selectDomainOption('existing');
            businessRegPage.enterAndCheckDomain(randomDomain, 3000);
            
            // Expect error toast since domain won't be found in provider
            cy.get('body').then(($body) => {
                const bodyText = $body.text();
                cy.log('Response:', bodyText);
                
                // Could be various error messages
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
            
            // Should show error for invalid format
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

    describe('Form Validation', () => {
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

            // Continue should be disabled without company name
            businessRegPage.continueButton().should('be.disabled');

            // Enter company name but don't agree to terms
            businessRegPage.organizationField().type(testData.companyName);
            businessRegPage.continueButton().should('be.disabled');

            // Agree to terms
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

            // Try weak password
            businessRegPage.passwordField().type('weak');
            cy.contains(/password/i).should('be.visible');

            // Use strong password
            businessRegPage.passwordField().clear().type(testData.password);
            businessRegPage.continueButton().should('not.be.disabled');
        });
    });

    describe('Domain Selection Options', () => {
        beforeEach(() => {
            businessRegPage.startSignUp();
            businessRegPage.selectBusinessAccount();
            businessRegPage.enterPersonalDetails(
                testData.firstName,
                testData.lastName,
                testData.email
            );
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
});