/**
 * Helper utilities for tests
 */

export const generateRandomEmail = () => {
    const timestamp = Date.now();
    return `test_${timestamp}@example.com`;
  };
  
  export const generateRandomString = (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  };
  
  export const waitForSeconds = (seconds) => {
    cy.wait(seconds * 1000);
  };
  
  export const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };
  
  export const loadFixture = (fixtureName) => {
    return cy.fixture(fixtureName);
  };