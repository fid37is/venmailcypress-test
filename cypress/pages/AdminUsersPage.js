class AdminUsersPage {
  // === Navigation ===
  goToUsersTab() {
    cy.contains('a, button, [role="tab"]', 'Users').click({ force: true });
    cy.contains('Users'); // wait for tab content
    return this;
  }

  openAddUserModal() {
    cy.contains('button', 'Add User').click({ force: true });
    return this;
  }

  // === Fill first step (your peer class inputs 0-4) ===
  fillBasicInfo(user) {
    const values = [
      user.firstName,
      user.lastName,
      user.primaryEmail || `${user.firstName}.${user.lastName}@test.com`.toLowerCase(),
      user.department || 'QA',
      user.recoveryEmail || 'recovery@test.com'
    ];

    cy.get('.peer').each(($input, i) => {
      if (i < 5) cy.wrap($input).clear().type(values[i]);
    });
    return this;
  }

  toggleForcePasswordChange() {
    cy.get('[role="checkbox"]').check({ force: true });
    return this;
  }

  selectPasswordGeneration(auto = true) {
    const index = auto ? 0 : 1;
    cy.get('[role="radio"]').eq(index).check({ force: true });
    return this;
  }

  setManualPassword(password) {
    cy.get('input[type="password"]').last().type(password);
    return this;
  }

  clickContinue() {
    cy.contains('button', 'Continue').click({ force: true });
    return this;
  }

  // === Final step - confirm creation ===
  confirmUserName(fullName) {
    cy.contains(fullName, { timeout: 10000 }).should('be.visible');
    return this;
  }

  togglePasswordVisibility() {
    cy.get('button').contains('Show').or('button[aria-label="Show password"]').click({ force: true });
    return this;
  }

  confirmPasswordVisible() {
    cy.get('input[type="text"]').should('be.visible'); // after toggle it becomes text
    return this;
  }

  clickCopyInvite() {
    cy.contains('button', 'Copy Invite').click({ force: true });
    cy.contains('Copied').should('be.visible');
    return this;
  }

  clickDone() {
    cy.contains('button', 'Done').click({ force: true });
    return this;
  }

  // === Verify user in list ===
  verifyUserInTable(fullName, email) {
    cy.contains(fullName).should('be.visible');
    cy.contains(email).should('be.visible');
    return this;
  }

  // === Delete user ===
  deleteUser(fullName) {
    cy.contains(fullName).parents('tr').within(() => {
      cy.get('button').contains('Delete').or('svg[aria-label="Delete"]').click({ force: true });
    });
    cy.contains('button', 'Confirm').click({ force: true });
    cy.contains(fullName).should('not.exist');
    return this;
  }
}

export default AdminUsersPage;