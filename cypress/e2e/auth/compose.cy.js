import LoginPage from '../../pages/LoginPage';
import EmailSendingPage from '../../pages/EmailSendingPage';

describe('Email Composition', () => {
    let emailPage;
    let userData;
    let emailData;

    before(() => {
        cy.fixture('users').then((data) => {
            userData = data;
        });
        cy.fixture('emails').then((data) => {
            emailData = data;
        });
    });

    beforeEach(() => {
        // Login before each test
        const { email, password } = userData.validUser;
        cy.loginAsUser(email, password);

        emailPage = new EmailSendingPage();
    });

    it('should compose and send a basic email', () => {
        emailPage.composeAndSend(emailData.basic);
        emailPage.verifyEmailSent();
    });

    it('should compose and send email with CC', () => {
        emailPage.composeAndSend(emailData.withCC);
        emailPage.verifyEmailSent();
    });

    it('should compose and send email with BCC', () => {
        emailPage.composeAndSend(emailData.withBCC);
        emailPage.verifyEmailSent();
    });

    it('should compose and send email with CC and BCC', () => {
        emailPage.composeAndSend(emailData.withAll);
        emailPage.verifyEmailSent();
    });

    it('should open compose window', () => {
        emailPage.clickCompose();
        emailPage.verifyComposerOpen();
    });

    it('should add CC field', () => {
        emailPage.clickCompose();
        emailPage.clickCcButton();
        emailPage.ccField().should('be.visible');
    });

    it('should add BCC field', () => {
        emailPage.clickCompose();
        emailPage.clickBccButton();
        emailPage.bccField().should('be.visible');
    });

    it('should fill all email fields correctly', () => {
        const email = emailData.withAll;

        emailPage.clickCompose();
        emailPage.fillTo(email.to);
        emailPage.clickCcButton();
        emailPage.fillCc(email.cc);
        emailPage.clickBccButton();
        emailPage.fillBcc(email.bcc);
        emailPage.fillSubject(email.subject);
        emailPage.fillBody(email.body);

        // Verify all fields are filled
        emailPage.toField().should('have.value', email.to);
        emailPage.ccField().should('have.value', email.cc);
        emailPage.bccField().should('have.value', email.bcc);
        emailPage.subjectField().should('have.value', email.subject);
    });

    it('should handle send confirmation modal', () => {
        emailSendingPage.clickCompose();
        emailPage.fillTo(emailData.basic.to);
        emailPage.fillSubject(emailData.basic.subject);
        emailPage.fillBody(emailData.basic.body);
        emailPage.clickSend();
        emailPage.handleSendConfirmation();
        emailPage.verifyEmailSent();
    });
});