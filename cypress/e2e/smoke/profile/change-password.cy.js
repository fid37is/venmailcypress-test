// cypress/e2e/user-profile/change-password-validation.cy.js
import ProfilePage from '../../../pages/ProfilePage';

describe('User Profile → Password Change – Full Validation', { tags: '@ci' }, () => {
  const profilePage = new ProfilePage();
  
  let USER_EMAIL;
  let ORIGINAL_PASSWORD;
  let NEW_PASSWORD;

  before(() => {
    cy.getUser('normalUser').then((user) => {
      USER_EMAIL = user.email;
      ORIGINAL_PASSWORD = user.password;
      NEW_PASSWORD = `TempPass${Date.now()}!`;
    });
  });

  beforeEach(() => {
    cy.normalUserLogin();
    cy.visit('/m/all');
    profilePage.openProfileFromAvatar();
    profilePage.goToPasswordTab();
  });

  it('1. Shows error when old password is incorrect', () => {
    profilePage.typeCurrentPassword('WrongPassword123!');
    profilePage.typeNewPassword('ValidNewPass123!');
    profilePage.typeConfirmPassword('ValidNewPass123!');

    profilePage.updatePasswordButton().click();

    cy.contains('The provided password does not match your current password.')
      .should('be.visible');
  });

  it('2. Shows error when new password is less than 8 characters', () => {
    profilePage.typeCurrentPassword(ORIGINAL_PASSWORD);
    profilePage.typeNewPassword('Ab1!');
    profilePage.typeConfirmPassword('Ab1!');

    profilePage.updatePasswordButton().click();

    cy.contains('The password field must be at least 8 characters.')
      .should('be.visible');
  });

  it('3. Shows error when confirmation does not match', () => {
    profilePage.typeCurrentPassword(ORIGINAL_PASSWORD);
    profilePage.typeNewPassword('SuperSecure123!!!');
    profilePage.typeConfirmPassword('Different123!!!');

    profilePage.updatePasswordButton().click();

    cy.contains('The password field confirmation does not match.')
      .should('be.visible');
  });

  it('4. Shows required errors when fields are empty', () => {
    profilePage.updatePasswordButton().click();

    cy.contains('The current password field is required.').should('be.visible');
    cy.contains('The password field is required.').should('be.visible');
  });

  it('5. Successfully changes password', () => {
    profilePage.typeCurrentPassword(ORIGINAL_PASSWORD);
    profilePage.typeNewPassword(NEW_PASSWORD);
    profilePage.typeConfirmPassword(NEW_PASSWORD);

    profilePage.updatePasswordButton().click();

    cy.contains('Password updated successfully', { timeout: 10000 })
      .should('be.visible');
  });

  it('6. Restore original password after test', () => {
    cy.log('Restoring password back to original...');

    profilePage.typeCurrentPassword(NEW_PASSWORD);
    profilePage.typeNewPassword(ORIGINAL_PASSWORD);
    profilePage.typeConfirmPassword(ORIGINAL_PASSWORD);

    profilePage.updatePasswordButton().click();

    cy.contains('Password updated successfully', { timeout: 10000 })
      .should('be.visible');

    cy.log('Password successfully restored to original');
  });
});