import RegistrationPage from '../../pages/RegistrationPage';

describe('User Registration', () => {
    let registrationPage;
    let userData;

    before(() => {
        cy.fixture('users').then((data) => {
            userData = data;
        });
    });

    beforeEach(() => {
        registrationPage = new RegistrationPage();
        registrationPage.visit();
    });

    it('should successfully register a new personal account', () => {
        const uniqueEmail = `testuser${Date.now()}@example.com`;
        const uniqueUsername = `user${Date.now()}`;

        const newUser = {
            firstName: userData.newUser.firstName,
            lastName: userData.newUser.lastName,
            email: uniqueEmail,
            username: uniqueUsername,
            password: userData.newUser.password,
            dateOfBirth: userData.newUser.dateOfBirth
        };

        registrationPage.completeRegistration(newUser);
        registrationPage.verifyRegistrationSuccess();
    });

    it('should navigate through registration steps correctly', () => {
        const uniqueEmail = `testuser${Date.now()}@example.com`;
        const uniqueUsername = `user${Date.now()}`;

        registrationPage.startSignUp();
        registrationPage.selectPersonalAccount();
        registrationPage.enterPersonalDetails(
            userData.newUser.firstName,
            userData.newUser.lastName,
            uniqueEmail
        );
        registrationPage.selectFreeBilling();
        registrationPage.enterUsername(uniqueUsername);
        registrationPage.enterPassword(userData.newUser.password);
        registrationPage.enterDateOfBirth(userData.newUser.dateOfBirth);
        registrationPage.verifyRegistrationSuccess();
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
        
        registrationPage.firstNameField().type('John');
        registrationPage.continueButton2().should('be.disabled');
        
        registrationPage.lastNameField().type('Doe');
        registrationPage.continueButton2().should('be.disabled');
        
        registrationPage.emailField().type('test@example.com');
        registrationPage.continueButton2().should('not.be.disabled');
    });

    it('should show error for weak password', () => {
        const uniqueEmail = `testuser${Date.now()}@example.com`;
        const uniqueUsername = `user${Date.now()}`;

        registrationPage.startSignUp();
        registrationPage.selectPersonalAccount();
        registrationPage.enterPersonalDetails(
            userData.newUser.firstName,
            userData.newUser.lastName,
            uniqueEmail
        );
        registrationPage.selectFreeBilling();
        registrationPage.enterUsername(uniqueUsername);
        registrationPage.passwordField().focus().clear().type('weak');
        
        cy.contains('password').should('be.visible');
    });
});