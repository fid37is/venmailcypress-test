// Import commands
import './commands';
// ✅ Correct cypress-grep support import
import '@cypress/grep';

// Global exception handling
Cypress.on('uncaught:exception', (err, runnable) => {
    console.log('Uncaught exception:', err.message);
    return false;
});

// Before each test
beforeEach(() => {
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
