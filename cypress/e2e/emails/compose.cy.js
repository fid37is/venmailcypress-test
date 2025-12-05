import EmailSendingPage from '../../pages/EmailSendingPage';

describe('Email Composition', () => {
    let emailPage;
    let emailData;

    before(() => {
        cy.normalUserLogin();
        cy.visit('/m/all');
        
        cy.fixture('emails').then((data) => {
            emailData = data;
        });
    });

    beforeEach(() => {
        emailPage = new EmailSendingPage();
        cy.visit('/m/all');
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

    it('should handle send confirmation modal', () => {
        emailPage.clickCompose();
        emailPage.fillTo(emailData.basic.to);
        emailPage.fillSubject(emailData.basic.subject);
        emailPage.fillBody(emailData.basic.body);
        emailPage.clickSend();
        emailPage.handleSendConfirmation();
        emailPage.verifyEmailSent();
    });
});