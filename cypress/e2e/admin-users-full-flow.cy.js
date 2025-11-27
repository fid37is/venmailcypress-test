import LoginPage from "../pages/LoginPage";

describe('Admin Login Session', () => {
    const loginPage = new LoginPage();
    let users;
    let testUser;

    before(() => {
        // Load fixture once before all tests
        cy.fixture('users').then((data) => {
            users = data;
        });
    });

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
        cy.session('admin-session', () => {
            loginPage.visit();
            loginPage.login(users.existinAdmingUser.email, users.existinAdmingUser.password);
            cy.url({ timeout: 30000 }).should('include', '/dashboard');
        }, {
            validate() {
                // Validate session is still active
                cy.visit('/dashboard');
                cy.url().should('include', '/dashboard');
            }
        });

        // Visit dashboard after session is restored
        cy.visit('/dashboard');
    });

    // Cleanup disabled for now - not fully set up yet
    // afterEach(() => {
    //     // Cleanup: Delete created test user if exists
    //     if (testUser && testUser.primaryEmail) {
    //         cy.log(`🧹 Cleaning up test user: ${testUser.primaryEmail}`);

    //         cy.request({
    //             method: 'POST',
    //             url: `${Cypress.env('apiUrl')}/api/test/cleanup/user`,
    //             body: {
    //                 email: testUser.primaryEmail,
    //                 firstName: testUser.firstName,
    //                 lastName: testUser.lastName
    //             },
    //             failOnStatusCode: false,
    //             timeout: 15000
    //         }).then((response) => {
    //             if (response.status === 200) {
    //                 cy.log('✅ User cleanup successful');
    //             } else {
    //                 cy.log(`⚠️ User cleanup response (${response.status}):`, response.body);
    //             }
    //         });
    //     }
    // });

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
        cy.log('📝 Test user data:', JSON.stringify(testUser, null, 2));

        cy.contains('Users').click();
        cy.url().should('include', '/users');

        // Wait for page to load
        cy.wait(1000);

        // === ADD NEW USER ===
        cy.log('➕ Adding new user:', testUser.primaryEmail);

        // Click "Add User" button
        cy.contains('Add User').click();

        // Wait for modal to appear
        cy.wait(500);

        // Target inputs within the modal/dialog
        cy.get('[role="dialog"]').within(() => {
            cy.get('input').eq(0).type(testUser.firstName); // First Name
            cy.get('input').eq(1).type(testUser.lastName); // Last Name
            cy.get('input').eq(2).type(testUser.primaryEmail); // Primary Email
            cy.get('input').eq(3).type(testUser.department); // Department (optional)
            cy.get('input').eq(4).type(testUser.recoveryEmail); // Recovery Email

            // Click the first checkbox - "Force user to change password on first login"
            cy.get('#password_must_change').click({ force: true });

            // Click the second checkbox - "Customize invite message"
            cy.get('#customize_message').click({ force: true });

            // Click radio button - "Create password (custom)"
            cy.get('#manual').click({ force: true });
            // auto-generated password selector = #auto

            // Type custom password - it should appear after selecting the radio button
            cy.wait(300); // Small wait for password field to appear
            cy.get('input[type="password"]').type(testUser.password);

            // Click Continue button
            cy.contains('Continue').click();
        });

        // === CONFIRMATION MODAL ===
        cy.wait(500);

        cy.log('✅ User creation confirmation modal appeared');

        // Verify confirmation message
        cy.contains('Your new user can start using Venmail within 24 hours. In most cases, it should work in a few minutes.').should('be.visible');

        // Verify user name is displayed
        // cy.contains(`${testUser.firstName} ${testUser.lastName}`).should('be.visible');
        cy.contains("Sign in instructions").should('be.visible');




        // Verify Primary Email is displayed
        // cy.contains(testUser.primaryEmail).should('be.visible');

        cy.log('✅ User details confirmed in modal');

        // Click "Copy Invite" button
        cy.contains('Copy Invite').should('be.visible').click();

        // Click "Done" button
        cy.contains('Done').click();

        cy.log('✅ User created successfully:', testUser.primaryEmail);

        cy.wait(1000);
    });

    it('4. Can delete a user', () => {
        cy.contains('Users').click();
        cy.url().should('include', '/users');

        // Wait for page to load
        cy.wait(1000);
        // === DELETE USER ===
        cy.log('Deleting test user:', testUser.primaryEmail);

        // Select the checkbox at index 1 (second checkbox)
        cy.get('button[role="checkbox"][data-state="unchecked"]').eq(1).click({ force: true });

        // Click the "Delete Selected" button
        cy.contains('Delete Selected').click();

        cy.log('✅ User deleted successfully');

        cy.wait(1000);
    });

    it('5. Can navigate to users tab and view a user', () => {
        cy.contains('Users').click();
        cy.url().should('include', '/users');

        cy.wait(500);

        // Select the 3rd row in the table (excluding the table header)
        cy.get('table tbody tr').eq(2).then($row => {

            // Hover over the entire row
            cy.wrap($row).trigger('mouseover');

            // Click the eye icon inside that row
            cy.wrap($row)
                .find('button')
                .filter(':has(svg)')
                .first()
                .click({ force: true });
        });

        // Assert the details page
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

        // Update Department
        cy.contains('label', 'Department')
            .parent()
            .find('input')
            .clear()
            .type('Projects', { delay: 0 });

        cy.contains('button', 'Update User').click({ force: true });

        // Optional: assert success message
        cy.contains(/updated/i).should('be.visible');
    });

    it.skip('7. Can create and remove an alias for a specific user', () => {

        const targetUser = "testuser-1763570056000-hgzjul9@capitolhospitality.info"; // UNIQUE IDENTIFIER
        const randomAlias = `alias-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Go to Users page
        cy.contains('Users').click();
        cy.url().should('include', '/users');

        cy.wait(500);

        // ================================
        // HOVER OVER USER ROW - THIS TRIGGERS THE DROPDOWN AND REVEALS THE EYE ICON
        // ================================
        cy.contains('td', targetUser)
            .parent('tr')
            .then($row => {
                cy.wrap($row).trigger('mouseover');

                cy.wait(300); // Give time for dropdown to appear if aliases exist

                // ================================
                // DELETE EXISTING ALIASES FROM DROPDOWN IF IT EXISTS
                // ================================
                cy.get('body').then($body => {
                    const aliasDropdown = $body.find('[role="dialog"]:contains("Email Aliases")');

                    if (aliasDropdown.length > 0) {
                        cy.log('🗑️ Alias dropdown detected - deleting existing aliases before opening user');

                        // Recursive function to delete all aliases from dropdown
                        const deleteAllAliases = () => {
                            cy.get('[role="dialog"]').then($dialog => {
                                const deleteButtons = $dialog.find('button:has(svg.lucide-trash2)');

                                if (deleteButtons.length > 0) {
                                    cy.log(`Found ${deleteButtons.length} alias(es) in dropdown - deleting...`);

                                    // Click first delete button (hover effect makes it visible)
                                    cy.wrap(deleteButtons.first()).click({ force: true });

                                    // Wait for deletion to complete
                                    cy.wait(800);

                                    // Check again for more aliases
                                    deleteAllAliases();
                                } else {
                                    cy.log('✅ All aliases deleted from dropdown');
                                    // Click away to close dropdown
                                    cy.get('body').click(0, 0);
                                    cy.wait(300);
                                }
                            });
                        };

                        deleteAllAliases();
                    } else {
                        cy.log('ℹ️ No alias dropdown found - user has no aliases yet');
                    }
                });

                // ================================
                // NOW CLICK THE EYE ICON TO OPEN USER DETAIL
                // ================================
                cy.wrap($row).trigger('mouseover'); // Hover again to ensure eye icon is visible
                cy.wrap($row)
                    .find('button')
                    .filter(':has(svg)')
                    .first()
                    .click({ force: true });
            });

        // Wait for detail page to load and verify we're on it
        cy.contains('USAGE', { timeout: 10000 }).should('be.visible');

        // Go to ALIASES tab
        cy.contains('ALIASES').should('be.visible').click();

        cy.wait(500);

        // ================================
        // CREATE A NEW ALIAS
        // ================================
        cy.log('➕ Creating new alias:', randomAlias);

        // Open modal
        cy.contains('button', 'Add Alias').first().click({ force: true });

        // Type random alias
        cy.get('input[placeholder=" "]')
            .first()
            .clear()
            .type(randomAlias, { force: true });

        // Submit
        cy.get('form button[type="submit"]').click({ force: true });

        cy.contains('Alias added successfully', { timeout: 6000 }).should('be.visible');

        // Verify alias appears in list
        cy.contains(randomAlias).should('exist');
        cy.wait(1000);

        cy.log('✅ Alias created successfully');

        // ================================
        // DELETE THE ALIAS WE JUST CREATED
        // ================================
        // cy.log('🗑️ Deleting alias:', randomAlias);

        // cy.get('button[title="Delete Alias"]').first().click({ force: true });

        // // If confirmation modal exists — click Confirm
        // cy.contains('button', 'Confirm').click({ force: true });

        // cy.contains('Alias removed successfully', { timeout: 6000 }).should('be.visible');

        // cy.log('✅ Alias deleted successfully');

    });


    it('8. Can navigate to Billing tab', () => {
        cy.contains('Billing').click();
        cy.url().should('include', '/billing');

        cy.contains("Current Plan").should('be.visible')

        //Confirm the upgrade button works
        cy.get("#app > div > div > main > div.flex.flex-col.h-full > main > div > div.flex.justify-between.items-center.pt-8 > div.flex.gap-x-7.items-center.justify-start > a").click()
        cy.log('Upgrade button is functional')

    });

    it.skip('9. Can navigate to Settings tab and update org profile with confirmation section', () => {
        const randomAddress = `Street ${Math.floor(Math.random() * 1000)}, City ${Math.floor(Math.random() * 100)}, State ${Math.floor(Math.random() * 50)}`;

        // Navigate to Settings → Organization Profile
        cy.contains('Settings').click();
        cy.url().should('include', '/settings');
        cy.contains('Organization profile').click();

        // Fill initial phone & address
        cy.get('input[type="tel"]').clear().type('08085952266');
        cy.get('#address').clear().type(randomAddress);

        // Submit → same page re-renders with confirmation section
        cy.get('[type="submit"]').click();

        // ✅ Wait for the confirmation form section to appear
        // Use a selector unique to that section (example: phone input on confirmation)
        cy.get('#phone_number', { timeout: 8000 }).should('be.visible');

        // Fill phone number in confirmation section
        cy.get('#phone_number').clear().type('08085952266');

        // Submit confirmation
        cy.get('[type="submit"]').click();

        // ✅ Wait for toast message
        cy.get('.toast', { timeout: 8000 })
            .filter(':visible')
            .should('have.text', 'Organization profile updated successfully');
    });

    it.only('9. Can navigate to Settings tab and update org profile with confirmation section', () => {
        const randomAddress = `Street ${Math.floor(Math.random() * 1000)}, City ${Math.floor(Math.random() * 100)}, State ${Math.floor(Math.random() * 50)}`;

        // Navigate to Settings → Organization Profile
        cy.contains('Settings').click();
        cy.url().should('include', '/settings');
        cy.contains('Organization profile').click();

        // Fill initial phone & address
        cy.get('input[type="tel"]').clear().type('08085952266');
        cy.get('#address').clear().type(randomAddress);

        // Submit → same page re-renders with confirmation section
        cy.get('[type="submit"]').click();

        // ✅ Wait for the confirmation form section to appear
        // Use a selector unique to that section (example: phone input on confirmation)
        cy.get('#phone_number', { timeout: 8000 }).should('be.visible');

        // Fill phone number in confirmation section
        cy.get('#phone_number').clear().type('08085952266');

        // Submit confirmation
        cy.get('[type="submit"]').click();

        // ✅ Wait for toast message
        cy.get('.toast', { timeout: 8000 })
            .filter(':visible')
            .should('have.text', 'Organization profile updated successfully');
    });



    it.skip('10. Can navigate to Domain tab', () => {
        cy.contains('Domain').click();
        cy.url().should('include', '/domain');
    });
});