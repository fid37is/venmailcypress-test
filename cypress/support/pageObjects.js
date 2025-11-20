/**
 * Central import file for all Page Objects
 * This makes page objects available throughout the test suite
 */

import BasePage from '../pages/BasePage';
import LoginPage from '../pages/LoginPage';
import RegistrationPage from '../pages/RegistrationPage';
import BusinessRegistrationPage from '../pages/BusinessRegistrationPage';
import EmailSendingPage from '../pages/EmailSendingPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import AdminUsersPage from '../pages/AdminUsersPage';

// Export all page objects
export {
  BasePage,
  LoginPage,
  RegistrationPage,
  BusinessRegistrationPage,
  EmailSendingPage,
  ForgotPasswordPage,
  AdminUsersPage
};

// Optional: Make them available globally
// This allows you to use them without importing in test files
global.BasePage = BasePage;
global.LoginPage = LoginPage;
global.RegistrationPage = RegistrationPage;
global.BusinessRegistrationPage = BusinessRegistrationPage;
global.EmailSendingPage = EmailSendingPage;
global.ForgotPasswordPage = ForgotPasswordPage;
global.AdminUsersPage = AdminUsersPage;