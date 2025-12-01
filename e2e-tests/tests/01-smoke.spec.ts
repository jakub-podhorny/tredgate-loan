import { test } from '@playwright/test';
import { LoanAppPage } from '../page-objects/loan-app.page';
import { clearLocalStorage } from '../helpers/test-helpers';

/**
 * Smoke Tests - Basic functionality and page load tests
 * These tests ensure the application loads correctly and basic UI elements are present
 */

test.describe('Smoke Tests', () => {
  let loanApp: LoanAppPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page object
    loanApp = new LoanAppPage(page);
    
    // Navigate to the application
    await loanApp.goto();
    
    // Clear localStorage after page load to ensure clean state
    await clearLocalStorage(page);
    
    // Reload to apply the cleared state
    await loanApp.reload();
  });

  test('should load the application successfully', async () => {
    // Verify page loads with correct title and main elements
    await loanApp.expectPageLoaded();
  });

  test('should display initial empty state', async () => {
    // Verify application shows empty state correctly
    await loanApp.expectInitialEmptyState();
  });

  test('should display loan form', async () => {
    // Verify loan form is visible with all fields
    await loanApp.form.expectFormVisible();
    await loanApp.form.expectAllFieldsVisible();
  });

  test('should display loan list section', async () => {
    // Verify loan list section is visible
    await loanApp.list.expectListVisible();
  });

  test('should display summary section with zero values', async () => {
    // Verify summary section displays initial zero values
    await loanApp.summary.expectInitialState();
  });

  test('should display empty message when no loans exist', async () => {
    // Verify empty message is shown when no loans are created
    await loanApp.list.expectEmptyMessage();
  });

  test('should have correct form field placeholders', async () => {
    // Verify form fields have correct placeholders
    await loanApp.form.expectApplicantNamePlaceholder();
  });
});
