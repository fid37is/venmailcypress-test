// cypress/pages/ProfilePage.js
class ProfilePage {
  // === ELEMENTS (unchanged) ===
  avatarButton = () => cy.get('button[aria-label="Select account"]', { timeout: 10000 });
  profileMenuItem = () => cy.contains('Profile', { timeout: 8000 });
  passwordTab = () => cy.contains('button[role="tab"]', 'Password', { timeout: 10000 });
  currentPasswordInput = () => cy.get('#current_password');
  newPasswordInput = () => cy.get('#password');
  confirmPasswordInput = () => cy.get('#password_confirmation');
  updatePasswordButton = () => cy.get('button[type="submit"]');

  // === NEW: SUCCESS & ERROR MESSAGES (exact text from your app) ===
  successMessage = () => cy.contains('Password updated successfully');
  
  errorCurrentPassword = () => cy.contains('The provided password does not match your current password.');
  errorPasswordTooShort = () => cy.contains('The password field must be at least 8 characters.');
  errorPasswordMismatch = () => cy.contains('The password field confirmation does not match.');
  errorCurrentRequired = () => cy.contains('The current password field is required.');
  errorNewRequired = () => cy.contains('The password field is required.');
  errorConfirmRequired = () => cy.contains('The password confirmation field is required.');

  // === ACTIONS (unchanged) ===
  openProfileFromAvatar() {
    this.avatarButton().click({ force: true });
    this.profileMenuItem().click();
    cy.url().should('include', '/profile');
  }

  goToPasswordTab() {
    this.passwordTab().click();
  }

  typeCurrentPassword(password) {
    this.currentPasswordInput().clear().type(password);
  }

  typeNewPassword(password) {
    this.newPasswordInput().clear().type(password);
  }

  typeConfirmPassword(password) {
    this.confirmPasswordInput().clear().type(password);
  }

  clickUpdatePassword() {
    cy.intercept('POST', '**/password**').as('changePassword');
    this.updatePasswordButton().click();
    // Do NOT wait here — we want to check inline errors immediately in negative tests
  }

  submitAndWaitForSuccess() {
    cy.intercept('POST', '**/password**').as('changePassword');
    this.updatePasswordButton().click();
    cy.wait('@changePassword').its('response.statusCode').should('be.oneOf', [200, 204]);
  }

  // === NEW: HELPER TO ASSERT SPECIFIC ERROR ===
  assertErrorVisible(errorMessageChainable) {
    errorMessageChainable
      .should('be.visible')
      .and('have.class', 'text-red-600'); // adjust class if yours is different (text-red-500, etc.)
  }

  // === FULL FLOWS ===
  changePasswordFromInbox(currentPassword, newPassword) {
    this.openProfileFromAvatar();
    this.goToPasswordTab();
    this.typeCurrentPassword(currentPassword);
    this.typeNewPassword(newPassword);
    this.typeConfirmPassword(newPassword);
    this.submitAndWaitForSuccess();
    this.successMessage().should('be.visible');
  }
}

export default ProfilePage;