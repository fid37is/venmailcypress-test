import BasePage from './BasePage';

class EmailSendingPage extends BasePage {
    // Selectors
    composeButton() {
        return cy.get('.mb-4 > .flex > .inline-flex');
    }

    ccButton() {
        return cy.contains('Cc');
    }

    bccButton() {
        return cy.contains('Bcc');
    }

    toField() {
        return cy.get('#composer-recipient-input');
    }

    ccField() {
        return cy.get('#composer-cc-input');
    }

    bccField() {
        return cy.get('#composer-bcc-input');
    }

    subjectField() {
        return cy.get('#subject');
    }

    bodyField() {
        return cy.get('.rsw-ce.w-full.relative.z-10');
    }

    sendButton() {
        return cy.contains('Send');
    }

    successMessage() {
        return cy.contains('Email sent successfully');
    }

    welcomeModalCloseButton() {
        return cy.contains('button', 'Start composing');
    }

    validationModal() {
        return cy.get('[role="dialog"]');
    }

    sendAnywayButton() {
        return cy.get('button.bg-red-600').contains('Send anyway');
    }

    closeValidationModalButton() {
        return cy.get('[role="dialog"] button svg').parent();
    }

    // Methods
    closeWelcomeModalIfVisible() {
        cy.get('body').then(($body) => {
            if ($body.find('button:contains("Start composing")').length > 0) {
                cy.contains('button', 'Start composing').click({ force: true });
                cy.wait(1000); // Wait for modal to close
            }
        });
    }

    closeValidationModalIfVisible() {
        cy.get('body').then(($body) => {
            // Check if validation modal is visible (Issue Found modal)
            if ($body.find('[role="dialog"]:contains("Issue Found")').length > 0) {
                // Click "Send anyway" button to proceed
                cy.get('button.bg-red-600').contains('Send anyway').click({ force: true });
                cy.wait(1000); // Wait for modal to close
            } else if ($body.find('[role="dialog"]').length > 0) {
                // If any other dialog is present, try to close it with the X button
                cy.get('[role="dialog"]').first().within(() => {
                    cy.get('button').contains('Send anyway').click({ force: true });
                });
                cy.wait(1000);
            }
        });
    }

    clickCompose() {
        // Click compose button first
        this.composeButton().click();
        cy.wait(500); // Give modal time to appear if it's going to
        
        // Close welcome modal if it's blocking the composer
        this.closeWelcomeModalIfVisible();
        
        // Now verify the composer is visible
        cy.contains('NEW MESSAGE').should('be.visible');
        cy.wait(2000);
    }

    clickCcButton() {
        this.ccButton().click();
        this.ccField().should('be.visible');
        cy.wait(1000);
    }

    clickBccButton() {
        this.bccButton().click();
        this.bccField().should('be.visible');
        cy.wait(1000);
    }

    fillTo(email) {
        this.toField().clear().type(email);
        cy.wait(500);
    }

    fillCc(email) {
        this.ccField().clear().type(email);
        cy.wait(500);
    }

    fillBcc(email) {
        this.bccField().clear().type(email);
        cy.wait(500);
    }

    fillSubject(subject) {
        this.subjectField().clear().type(subject);
        cy.wait(500);
    }

    fillBody(body) {
        this.bodyField().clear().type(body);
        cy.wait(500);
    }

    clickSend() {
        this.sendButton().click();
        cy.wait(2000);
        
        // Check and close validation modal if it appears after clicking send
        this.closeValidationModalIfVisible();
    }

    handleSendConfirmation() {
        cy.get('body').then(($body) => {
            if ($body.find('[data-cy="send-confirmation-modal"]').length > 0) {
                cy.get('[data-cy="send-confirmation-modal"]').within(() => {
                    cy.contains('Send anyway').click();
                });
                cy.wait(2000);
            }
        });
    }

    // Complete compose and send flow
    composeAndSend(emailData) {
        this.clickCompose();
        this.fillTo(emailData.to);
        
        if (emailData.cc) {
            this.clickCcButton();
            this.fillCc(emailData.cc);
        }
        
        if (emailData.bcc) {
            this.clickBccButton();
            this.fillBcc(emailData.bcc);
        }
        
        this.fillSubject(emailData.subject);
        this.fillBody(emailData.body);
        this.clickSend();
        this.handleSendConfirmation();
    }

    verifyEmailSent() {
        this.successMessage().should('be.visible');
    }

    verifyComposerOpen() {
        cy.contains('NEW MESSAGE').should('be.visible');
    }
}

export default EmailSendingPage;