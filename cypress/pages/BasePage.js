class BasePage {
    visit(path = '') {
      cy.visit(path);
    }
  
    waitForPageLoad() {
      cy.window().its('document.readyState').should('equal', 'complete');
    }
  
    getElement(selector) {
      return cy.get(selector);
    }
  
    clickElement(selector) {
      cy.get(selector).click();
    }
  
    typeIntoElement(selector, text) {
      cy.get(selector).clear().type(text);
    }
  
    verifyUrl(path) {
      cy.url().should('include', path);
    }
  
    verifyElementVisible(selector) {
      cy.get(selector).should('be.visible');
    }
  
    verifyElementContainsText(selector, text) {
      cy.get(selector).should('contain', text);
    }
  }
  
  export default BasePage;