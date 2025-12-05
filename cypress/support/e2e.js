// Import commands
import './commands';

// Global exception handling
Cypress.on('uncaught:exception', (err, runnable) => {
    // Prevent failing on uncaught exceptions
    console.log('Uncaught exception:', err.message);
    return false;
});

// Before each test
beforeEach(() => {
    // DON'T clear all cookies - preserve session cookies
    // cy.clearCookies();
    // cy.clearLocalStorage();
    
    cy.viewport(1280, 720);
});

// After each test - screenshot on failure
afterEach(function() {
    if (this.currentTest.state === 'failed') {
        const testName = this.currentTest.title.replace(/\s+/g, '-');
        const suiteName = this.currentTest.parent.title.replace(/\s+/g, '-');
        cy.screenshot(`${suiteName}_${testName}_FAILED`, { capture: 'fullPage' });
    }
});