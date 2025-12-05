// cypress/e2e/admin-dashboard/admin-session.cy.js
import LoginPage from "../../pages/LoginPage";

describe('Admin Login Session', () => {
    const loginPage = new LoginPage();
    let testUser;

    beforeEach(() => {
        // Generate unique test user data for each test
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 9);

        testUser = {
            firstName: 'TestUser',
            lastName: `User${randomId}`,
            primaryEmail: `testuser-${timestamp}-${randomId}`,
            department: `Dept${randomId}`,
            recoveryEmail: `recovery-${timestamp}-${randomId}@yopmail.com`,
            password: 'SecurePass123!'
        };

        // Preserve session across tests
        cy.adminLogin();
    });

    it('1. Admin successfully logs in', () => {
        cy.contains('Welcome to your Venmail, manage your domain, users, billings and your products').should('be.visible');
    });

    it('2. Confirm visible admin tabs', () => {
        cy.contains('Dashboard').should('be.visible');
        cy.contains('Users').should('be.visible');
        cy.contains('Billing').should('be.visible');
        cy.contains('Settings').should('be.visible');
        cy.contains('Domain').should('be.visible');
    });

    it('3. Can navigate to Users tab, delete a user, and add a new user', () => {
        cy.log('Test user data:', JSON.stringify(testUser, null, 2));

        cy.contains('Users').click();
        cy.url().should('include', '/users');

        cy.wait(1000);

        cy.log('Adding new user:', testUser.primaryEmail);

        cy.contains('Add User').click();

        cy.wait(500);

        cy.get('[role="dialog"]').within(() => {
            cy.get('input').eq(0).type(testUser.firstName);
            cy.get('input').eq(1).type(testUser.lastName);
            cy.get('input').eq(2).type(testUser.primaryEmail);
            cy.get('input').eq(3).type(testUser.department);
            cy.get('input').eq(4).type(testUser.recoveryEmail);

            cy.get('#password_must_change').click({ force: true });

            cy.get('#customize_message').click({ force: true });

            cy.get('#manual').click({ force: true });

            cy.wait(300);
            cy.get('input[type="password"]').type(testUser.password);

            cy.contains('Continue').click();
        });

        cy.wait(500);

        cy.log('User creation confirmation modal appeared');

        cy.contains('Your new user can start using Venmail within 24 hours. In most cases, it should work in a few minutes.').should('be.visible');

        cy.contains("Sign in instructions").should('be.visible');

        cy.log('User details confirmed in modal');

        cy.contains('Copy Invite').should('be.visible').click();

        cy.contains('Done').click();

        cy.log('User created successfully:', testUser.primaryEmail);

        cy.wait(1000);
    });

    it('4. Can delete a user', () => {
        cy.contains('Users').click();
        cy.url().should('include', '/users');

        cy.wait(1000);

        cy.log('Deleting test user:', testUser.primaryEmail);

        cy.get('button[role="checkbox"][data-state="unchecked"]').eq(1).click({ force: true });

        cy.contains('Delete Selected').click();

        cy.log('User deleted successfully');

        cy.wait(1000);
    });

    it('5. Can navigate to users tab and view a user', () => {
        cy.contains('Users').click();
        cy.url().should('include', '/users');

        cy.wait(500);

        cy.get('table tbody tr').eq(2).then($row => {

            cy.wrap($row).trigger('mouseover');

            cy.wrap($row)
                .find('button')
                .filter(':has(svg)')
                .first()
                .click({ force: true });
        });

        cy.contains('USAGE').should('be.visible');
    });

    it('6. Can navigate to users tab, view a user, and update account', () => {
        cy.contains('Users').click();
        cy.url().should('include', '/users');

        cy.wait(500);

        cy.get('table tbody tr').eq(2).then($row => {
            cy.wrap($row).trigger('mouseover');
            cy.wrap($row)
                .find('button')
                .filter(':has(svg)')
                .first()
                .click({ force: true });
        });

        cy.contains('Update Account').should('be.visible').click();

        cy.contains('label', 'Department')
            .parent()
            .find('input')
            .clear()
            .type('Projects', { delay: 0 });

        cy.contains('button', 'Update User').click({ force: true });

        cy.contains(/updated/i).should('be.visible');
    });

    it.skip('7. Can create and remove an alias for a specific user', () => {

        const targetUser = "testuser-1763570056000-hgzjul9@capitolhospitality.info";
        const randomAlias = `alias-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        cy.contains('Users').click();
        cy.url().should('include', '/users');

        cy.wait(500);

        cy.contains('td', targetUser)
            .parent('tr')
            .then($row => {
                cy.wrap($row).trigger('mouseover');

                cy.wait(300);

                cy.get('body').then($body => {
                    const aliasDropdown = $body.find('[role="dialog"]:contains("Email Aliases")');

                    if (aliasDropdown.length > 0) {
                        cy.log('Alias dropdown detected - deleting existing aliases before opening user');

                        const deleteAllAliases = () => {
                            cy.get('[role="dialog"]').then($dialog => {
                                const deleteButtons = $dialog.find('button:has(svg.lucide-trash2)');

                                if (deleteButtons.length > 0) {
                                    cy.log(`Found ${deleteButtons.length} alias(es) in dropdown - deleting...`);

                                    cy.wrap(deleteButtons.first()).click({ force: true });

                                    cy.wait(800);

                                    deleteAllAliases();
                                } else {
                                    cy.log('All aliases deleted from dropdown');
                                    cy.get('body').click(0, 0);
                                    cy.wait(300);
                                }
                            });
                        };

                        deleteAllAliases();
                    } else {
                        cy.log('No alias dropdown found - user has no aliases yet');
                    }
                });

                cy.wrap($row).trigger('mouseover');
                cy.wrap($row)
                    .find('button')
                    .filter(':has(svg)')
                    .first()
                    .click({ force: true });
            });

        cy.contains('USAGE', { timeout: 10000 }).should('be.visible');

        cy.contains('ALIASES').should('be.visible').click();

        cy.wait(500);

        cy.log('Creating new alias:', randomAlias);

        cy.contains('button', 'Add Alias').first().click({ force: true });

        cy.get('input[placeholder=" "]')
            .first()
            .clear()
            .type(randomAlias, { force: true });

        cy.get('form button[type="submit"]').click({ force: true });

        cy.contains('Alias added successfully', { timeout: 6000 }).should('be.visible');

        cy.contains(randomAlias).should('exist');
        cy.wait(1000);

        cy.log('Alias created successfully');

    });


    it('8. Can navigate to Billing tab', () => {
        cy.contains('Billing').click();
        cy.url().should('include', '/billing');

        cy.contains("Current Plan").should('be.visible')

        cy.get("#app > div > div > main > div.flex.flex-col.h-full > main > div > div.flex.justify-between.items-center.pt-8 > div.flex.gap-x-7.items-center.justify-start > a").click()
        cy.log('Upgrade button is functional')

    });

    it.skip('9. Can navigate to Settings tab and update org profile with confirmation section', () => {
        const randomAddress = `Test St ${Cypress._.random(1, 999)}, Lagos`;

        cy.contains('Settings').click();
        cy.url().should('include', '/settings');
        cy.contains('Organization profile').click();

        cy.get('input[type="tel"]').clear().type('08085952266');
        cy.get('#address').clear().type(randomAddress);
        cy.get('[type="submit"]').click();

        cy.get('#phone_number', { timeout: 12000 }).should('be.visible').clear().type('08085952266');

        cy.get('[type="submit"]').click();

        cy.contains('.toast', 'Organization profile updated successfully', { timeout: 10000 })
            .should('be.visible');
    });


    it('10. Can navigate to Domain tab', () => {
        cy.contains('Domain').click();
        cy.url().should('include', '/domain');
    });
});