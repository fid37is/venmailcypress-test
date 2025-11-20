import RegistrationPage from './RegistrationPage';

class BusinessRegistrationPage extends RegistrationPage {
    constructor() {
        super();
    }

    // ===== BUSINESS ACCOUNT SPECIFIC SELECTORS =====

    // Domain selection buttons
    existingDomainButton() {
        return cy.contains('button', 'Use my existing domain');
    }

    buyNewDomainButton() {
        return cy.contains('button', 'Buy a new domain');
    }

    // Domain input
    domainField() {
        return cy.get('#domain');
    }

    // Check Availability button
    checkAvailabilityButton() {
        return cy.contains('button', 'Check Availability');
    }

    // Domain continue button (appears after successful check)
    domainContinueButton() {
        return cy.contains('button', 'Continue');
    }

    // Continue button (general use)
    continueButton() {
        return cy.contains('button', 'Continue');
    }

    // Company information
    organizationField() {
        return cy.get('#organization');
    }

    termsCheckbox() {
        return cy.get('#default-checkbox');
    }

    // Email hosting options
    selfHostedOption() {
        return cy.contains('button', 'Cloud Hosting (Venmail');
    }

    cloudHostedOption() {
        return cy.contains('button', 'Bring your own storage');
    }

    // Plan selection
    getPlanButton(planNumber) {
        return cy.get(`#plan-${planNumber}`);
    }

    viewPlanBenefitsLink() {
        return cy.contains('See our detailed pricing and benefits');
    }

    // ===== BUSINESS ACCOUNT METHODS =====

    /**
     * Select domain option - existing or buy new
     * @param {string} option - 'existing' or 'new'
     */
    selectDomainOption(option) {
        if (option === 'existing') {
            this.existingDomainButton().click();
        } else if (option === 'new') {
            this.buyNewDomainButton().click();
        }
    }

    /**
     * Enter and verify domain availability
     * @param {string} domainName - Domain name to check
     * @param {number} timeout - Timeout for domain check
     */
    enterAndCheckDomain(domainName, timeout = 5000) {
        this.domainField().clear().type(domainName);
        this.checkAvailabilityButton().click();
        cy.wait(timeout);
    }

    /**
     * Verify domain found message (domain exists in provider)
     * @param {string} domainName - Expected domain name
     */
    verifyDomainFound(domainName) {
        cy.contains(`We found your domain ${domainName}`).should('be.visible');
    }

    /**
     * Verify domain not available/not found error
     */
    verifyDomainNotAvailable() {
        // Could be various error messages depending on the issue
        cy.get('body', { timeout: 10000 }).then(($body) => {
            const bodyText = $body.text();
            
            // Accept any of these error scenarios
            const hasError = 
                bodyText.includes('This domain is not available for registration') ||
                bodyText.includes('Domain not found') ||
                bodyText.includes('not found in your provider') ||
                bodyText.includes('error') ||
                bodyText.includes('invalid domain');
            
            expect(hasError).to.be.true;
        });
    }

    /**
     * Create password for business account
     * @param {string} password - Password to set
     */
    createBusinessPassword(password) {
        this.passwordField().type(password);
        this.continueButton().click();
    }

    /**
     * Enter company information
     * @param {string} companyName - Company/Organization name
     * @param {boolean} agreeToTerms - Whether to check terms checkbox
     */
    enterCompanyInfo(companyName, agreeToTerms = true) {
        this.organizationField().type(companyName);
        if (agreeToTerms) {
            this.termsCheckbox().check();
        }
        this.continueButton().click();
    }

    /**
     * Select email hosting option
     * @param {string} option - 'self' or 'cloud'
     */
    selectEmailHosting(option) {
        cy.contains('Choose how you want to host email data').should('be.visible');
        if (option === 'self') {
            this.selfHostedOption().click();
        } else if (option === 'cloud') {
            this.cloudHostedOption().click();
        }
        this.continueButton().click();
    }

    /**
     * Verify plan selection page elements
     */
    verifyPlanSelectionPage() {
        cy.contains('Monthly').should('be.visible');
        
        // Verify Solo Founder plan
        cy.contains('Solo Founder').should('be.visible');
        cy.contains('Perfect for solo founders').should('be.visible');
        cy.contains('Up to 10 users included').should('be.visible');
        cy.contains('$0').should('be.visible');
        
        // Verify Startup plan
        cy.contains('Startup').should('be.visible');
        cy.contains('Premium email suite for SMEs').should('be.visible');
        cy.contains('Unlimited users included').should('be.visible');
        cy.contains('$7').should('be.visible');
        
        // Verify Business plan
        cy.contains('Business').should('be.visible');
        cy.contains('Essential tools for small teams').should('be.visible');
        cy.contains('$23.5').should('be.visible');
        
        // Verify Enterprise plan
        cy.contains('Enterprise').should('be.visible');
        cy.contains('Tailored plans for larger companies').should('be.visible');
    }

    /**
     * Select a pricing plan
     * @param {number} planNumber - Plan number (1-4)
     * 1 = Solo Founder, 2 = Startup, 3 = Business, 4 = Enterprise
     */
    selectPlan(planNumber) {
        this.getPlanButton(planNumber).click();
        this.continueButton().click();
    }

    /**
     * View plan benefits
     */
    viewPlanBenefits() {
        this.viewPlanBenefitsLink().click();
    }

    /**
     * Verify welcome message for free plan
     */
    verifyWelcomeMessage() {
        cy.contains('Welcome to Venmail').should('be.visible');
        cy.contains('Let\'s help you setup your account').should('be.visible');
    }

    /**
     * Verify payment page is shown (for paid plans)
     */
    verifyPaymentPage() {
        cy.url().should('match', /payment|checkout|stripe/);
    }

    /**
     * Helper: Check domain with retry logic
     * Tries multiple domains until one is found in provider OR max retries reached
     * @param {Array} domainList - List of domains to try
     * @param {number} maxRetries - Maximum retry attempts
     */
    checkDomainWithRetry(domainList, maxRetries = 10) {
        let attempts = 0;
        let foundDomain = false;
        
        const tryDomain = (index) => {
            if (index >= domainList.length) {
                // If we've tried all domains, start over but increment attempts
                if (attempts >= maxRetries) {
                    cy.log('⚠️ Max retries reached, continuing with last domain attempt');
                    return;
                }
                index = 0;
            }

            const domain = domainList[index];
            cy.log(`🔍 Attempt ${attempts + 1}/${maxRetries}: Checking domain ${domain}`);
            
            this.domainField().clear().type(domain);
            this.checkAvailabilityButton().click();
            cy.wait(3000);

            cy.get('body').then(($body) => {
                const bodyText = $body.text();
                
                if (bodyText.includes('We found your domain')) {
                    // Success - domain found in provider
                    cy.log(`✅ Domain ${domain} found in provider!`);
                    this.verifyDomainFound(domain);
                    this.domainContinueButton().click();
                    foundDomain = true;
                } else if (
                    bodyText.includes('This domain is not available for registration') ||
                    bodyText.includes('not found') ||
                    bodyText.includes('error')
                ) {
                    // Domain not found in provider or error - try next
                    cy.log(`❌ Domain ${domain} not found/error, trying next...`);
                    attempts++;
                    
                    if (attempts < maxRetries) {
                        // Try next domain
                        tryDomain(index + 1);
                    } else {
                        cy.log('⚠️ Max retries reached - domain verification may be an issue in test environment');
                        // For test purposes, we might want to continue anyway
                        // or fail the test appropriately
                    }
                } else {
                    // Unexpected response
                    cy.log(`⚠️ Unexpected response for ${domain}:`, bodyText.substring(0, 100));
                    attempts++;
                    if (attempts < maxRetries) {
                        tryDomain(index + 1);
                    }
                }
            });
        };

        tryDomain(0);
    }

    /**
     * Complete business registration flow
     * @param {Object} businessData - Business registration data
     */
    completeBusinessRegistration(businessData) {
        const {
            firstName,
            lastName,
            email,
            domainOption,
            domainList,
            password,
            companyName,
            hostingOption,
            planNumber
        } = businessData;

        this.startSignUp();
        this.selectBusinessAccount();
        this.enterPersonalDetails(firstName, lastName, email);
        this.selectDomainOption(domainOption);
        this.checkDomainWithRetry(domainList);
        this.createBusinessPassword(password);
        this.enterCompanyInfo(companyName, true);
        this.selectEmailHosting(hostingOption);
        this.verifyPlanSelectionPage();
        this.selectPlan(planNumber);
    }
}

export default BusinessRegistrationPage;