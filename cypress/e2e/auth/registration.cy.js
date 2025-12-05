import RegistrationPage from '../../pages/RegistrationPage';

describe('User Registration', () => {
    let registrationPage;
    let testUser;

    before(() => {
        // Use environment variables for reference data only
        testUser = {
            firstName: Cypress.env('NORMAL_USER_FIRSTNAME') || 'Test',
            lastName: Cypress.env('NORMAL_USER_LASTNAME') || 'User',
            dateOfBirth: '1990-01-01' // Static test data
        };
        
        cy.log(`Test user template configured: ${testUser.firstName} ${testUser.lastName}`);
    });

    beforeEach(() => {
        registrationPage = new RegistrationPage();
        registrationPage.visit();
    });

    it('should successfully register a new personal account', () => {
        // Generate unique credentials for new user
        const timestamp = Date.now();
        const uniqueId = Math.random().toString(36).substring(7);
        
        cy.generateValidPassword().then(validPassword => {
            const newUser = {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: `test-${uniqueId}-${timestamp}@venmail-test.io`,
                username: `testuser${uniqueId}${timestamp}`,
                password: validPassword,
                dateOfBirth: testUser.dateOfBirth
            };

            cy.log(`Creating new user: ${newUser.email}`);
            cy.log(`Using password: ${validPassword}`);
            
            registrationPage.completeRegistration(newUser);
            registrationPage.verifyRegistrationSuccess();
        });
    });

    it('should navigate through registration steps correctly', () => {
        // Generate unique credentials
        const timestamp = Date.now();
        const uniqueId = Math.random().toString(36).substring(7);
        const uniqueEmail = `test-${uniqueId}-${timestamp}@venmail-test.io`;
        const uniqueUsername = `user${uniqueId}${timestamp}`;

        cy.generateValidPassword().then(validPassword => {
            cy.log(`Testing registration flow for: ${uniqueEmail}`);
            cy.log(`Using password: ${validPassword}`);

            registrationPage.startSignUp();
            registrationPage.selectPersonalAccount();
            registrationPage.enterPersonalDetails(
                testUser.firstName,
                testUser.lastName,
                uniqueEmail
            );
            registrationPage.selectFreeBilling();
            registrationPage.enterUsername(uniqueUsername);
            registrationPage.enterPassword(validPassword);
            registrationPage.enterDateOfBirth(testUser.dateOfBirth);
            registrationPage.verifyRegistrationSuccess();
        });
    });

    it('should select business account type', () => {
        registrationPage.startSignUp();
        registrationPage.selectBusinessAccount();
        registrationPage.firstNameField().should('be.visible');
    });

    it('should disable continue button when required fields are empty', () => {
        registrationPage.startSignUp();
        registrationPage.selectPersonalAccount();
        
        registrationPage.continueButton2().should('be.disabled');
        
        registrationPage.firstNameField().type(testUser.firstName);
        registrationPage.continueButton2().should('be.disabled');
        
        registrationPage.lastNameField().type(testUser.lastName);
        registrationPage.continueButton2().should('be.disabled');
        
        // Use unique test email
        const testEmail = `validation-${Date.now()}@venmail-test.io`;
        registrationPage.emailField().type(testEmail);
        registrationPage.continueButton2().should('not.be.disabled');
    });

    it('should show error for weak password', () => {
        // Generate unique credentials
        const timestamp = Date.now();
        const uniqueId = Math.random().toString(36).substring(7);
        const uniqueEmail = `weak-pwd-test-${uniqueId}-${timestamp}@venmail-test.io`;
        const uniqueUsername = `user${uniqueId}${timestamp}`;

        registrationPage.startSignUp();
        registrationPage.selectPersonalAccount();
        registrationPage.enterPersonalDetails(
            testUser.firstName,
            testUser.lastName,
            uniqueEmail
        );
        registrationPage.selectFreeBilling();
        registrationPage.enterUsername(uniqueUsername);
        
        // Test password without uppercase
        registrationPage.passwordField().focus().clear().type('weak1234');
        cy.contains(/uppercase|capital/i, { timeout: 5000 }).should('be.visible');
        
        // Test password without digit
        registrationPage.passwordField().focus().clear().type('WeakPass');
        cy.contains(/digit|number/i, { timeout: 5000 }).should('be.visible');
        
        // Test password too short
        registrationPage.passwordField().focus().clear().type('Weak1');
        cy.contains(/8 characters|at least 8/i, { timeout: 5000 }).should('be.visible');
    });

    // Environment-aware test - only run in non-production
    it('should handle duplicate email registration', function() {
        const env = Cypress.env('environment') || 'staging';
        
        if (env === 'production') {
            this.skip(); // Skip in production to avoid creating test data
        }

        const timestamp = Date.now();
        const uniqueId = Math.random().toString(36).substring(7);
        const duplicateEmail = `duplicate-${uniqueId}-${timestamp}@venmail-test.io`;
        const username1 = `user1-${uniqueId}${timestamp}`;

        cy.generateValidPassword().then(validPassword => {
            // First registration
            const user1 = {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: duplicateEmail,
                username: username1,
                password: validPassword,
                dateOfBirth: testUser.dateOfBirth
            };

            cy.log('Registering first user with email:', duplicateEmail);
            registrationPage.completeRegistration(user1);
            registrationPage.verifyRegistrationSuccess();

            // Visit registration again
            registrationPage.visit();

            // Try to register with same email
            registrationPage.startSignUp();
            registrationPage.selectPersonalAccount();
            registrationPage.enterPersonalDetails(
                testUser.firstName,
                testUser.lastName,
                duplicateEmail // Same email
            );

            // Should show error for duplicate email
            cy.contains(/email.*already.*exist|already.*registered/i, { timeout: 10000 })
                .should('be.visible');
        });
    });

    afterEach(function() {
        // Log test result for debugging
        const env = Cypress.env('environment') || 'staging';
        const state = this.currentTest.state;
        
        cy.log(`Test: ${this.currentTest.title}`);
        cy.log(`Environment: ${env}`);
        cy.log(`Status: ${state}`);
    });
});