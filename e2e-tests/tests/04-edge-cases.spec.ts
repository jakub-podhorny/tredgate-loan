import { test, expect } from '@playwright/test';
import { LoanAppPage } from '../page-objects/loan-app.page';
import { clearLocalStorage } from '../helpers/test-helpers';
import { TEST_DATA } from '../data/text-library';

/**
 * Edge Cases and Validation Tests
 * These tests verify input validation and edge cases
 */

test.describe('Edge Cases and Validation', () => {
  let loanApp: LoanAppPage;

  test.beforeEach(async ({ page }) => {
    loanApp = new LoanAppPage(page);
    await loanApp.goto();
    await clearLocalStorage(page);
    await loanApp.reload();
  });

  test.describe('Form Validation - Empty Values', () => {
    test('should not create loan with empty applicant name', async ({ page }) => {
      const loanData = TEST_DATA.INVALID_EMPTY_NAME;

      // Try to create loan with empty name
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );

      // Verify no loan was created
      await loanApp.list.expectEmptyMessage();
      await loanApp.list.expectLoanCount(0);

      // Verify summary remains at zero
      await loanApp.summary.expectInitialState();
    });

    test('should not create loan with zero amount', async () => {
      const loanData = TEST_DATA.INVALID_ZERO_AMOUNT;

      // Try to create loan with zero amount
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );

      // Verify no loan was created
      await loanApp.list.expectEmptyMessage();
    });

    test('should not create loan with zero term', async () => {
      const loanData = TEST_DATA.INVALID_ZERO_TERM;

      // Try to create loan with zero term
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );

      // Verify no loan was created
      await loanApp.list.expectEmptyMessage();
    });
  });

  test.describe('Form Validation - Negative Values', () => {
    test('should not create loan with negative amount', async () => {
      const loanData = TEST_DATA.INVALID_NEGATIVE_AMOUNT;

      // Try to create loan with negative amount
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );

      // Verify no loan was created
      await loanApp.list.expectEmptyMessage();
    });

    test('should not create loan with negative interest rate', async () => {
      const loanData = TEST_DATA.INVALID_NEGATIVE_RATE;

      // Try to create loan with negative rate
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );

      // Verify no loan was created
      await loanApp.list.expectEmptyMessage();
    });
  });

  test.describe('Boundary Values', () => {
    test('should create loan at auto-approve boundary (exactly $100,000 and 60 months)', async () => {
      // Create loan at the exact boundary for auto-approve
      await loanApp.form.createLoanApplication(
        'Boundary User',
        '100000',
        '60',
        '0.05'
      );

      // Loan should be created
      await loanApp.list.expectLoanCount(1);

      // Auto-decide should approve it
      await loanApp.list.autoDecideLoan(0);
      await loanApp.list.expectLoanStatus('approved', 0);
    });

    test('should auto-reject loan just above amount boundary ($100,001)', async () => {
      // Create loan just above the boundary
      await loanApp.form.createLoanApplication(
        'Above Boundary User',
        '100001',
        '60',
        '0.05'
      );

      // Auto-decide should reject it
      await loanApp.list.autoDecideLoan(0);
      await loanApp.list.expectLoanStatus('rejected', 0);
    });

    test('should auto-reject loan just above term boundary (61 months)', async () => {
      // Create loan just above the term boundary
      await loanApp.form.createLoanApplication(
        'Above Term Boundary',
        '100000',
        '61',
        '0.05'
      );

      // Auto-decide should reject it
      await loanApp.list.autoDecideLoan(0);
      await loanApp.list.expectLoanStatus('rejected', 0);
    });
  });

  test.describe('Special Characters and Formatting', () => {
    test('should handle applicant names with special characters', async () => {
      const specialNames = [
        "O'Brien",
        'Jean-Claude',
        'José García',
        'Smith Jr.',
      ];

      for (const name of specialNames) {
        await loanApp.form.createLoanApplication(name, '50000', '36', '0.08');
      }

      // Verify all loans were created
      await loanApp.list.expectLoanCount(specialNames.length);
    });

    test('should handle very large loan amounts', async () => {
      // Create loan with very large amount
      await loanApp.form.createLoanApplication(
        'High Roller',
        '9999999',
        '60',
        '0.05'
      );

      // Verify loan was created
      await loanApp.list.expectLoanCount(1);
      
      // Verify the amount is displayed correctly (with proper formatting)
      const amount = await loanApp.list.getLoanAmount(0);
      expect(amount).toContain('$');
      expect(amount).toContain('9,999,999');
    });

    test('should handle very long term periods', async () => {
      // Create loan with very long term
      await loanApp.form.createLoanApplication(
        'Long Term User',
        '50000',
        '360', // 30 years
        '0.04'
      );

      // Verify loan was created
      await loanApp.list.expectLoanCount(1);
      
      // Verify the term is displayed correctly
      const term = await loanApp.list.getLoanTerm(0);
      expect(term).toBe('360 mo');
    });

    test('should handle zero interest rate', async () => {
      // Create loan with zero interest rate
      await loanApp.form.createLoanApplication(
        'Zero Interest User',
        '50000',
        '36',
        '0'
      );

      // Verify loan was created
      await loanApp.list.expectLoanCount(1);
      
      // Verify the rate is displayed as 0.0%
      const rate = await loanApp.list.getLoanRate(0);
      expect(rate).toBe('0.0%');

      // Monthly payment should be amount / term
      const payment = await loanApp.list.getLoanMonthlyPayment(0);
      // $50,000 / 36 = $1,388.89
      expect(payment).toContain('$1,388.89');
    });
  });

  test.describe('LocalStorage Edge Cases', () => {
    test('should handle corrupted localStorage data gracefully', async ({ page }) => {
      // Set corrupted data in localStorage
      await page.evaluate(() => {
        localStorage.setItem('tredgate_loans', 'corrupted-data');
      });

      // Reload page
      await loanApp.reload();

      // Application should handle this gracefully and show empty state
      // (depends on implementation - may show error or empty state)
      await loanApp.expectPageLoaded();
    });

    test('should persist loans after page refresh', async () => {
      const loanData = TEST_DATA.VALID_LOAN_SMALL;

      // Create loan
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );

      // Approve loan
      await loanApp.list.approveLoan(0);

      // Reload page
      await loanApp.reload();

      // Verify loan persists with correct status
      await loanApp.list.expectLoanCount(1);
      await loanApp.list.expectLoanStatus('approved', 0);
      await loanApp.summary.expectApprovedCount(1);
    });
  });

  test.describe('Concurrent Operations', () => {
    test('should handle rapid form submissions', async () => {
      // Submit multiple loans quickly
      const loans = [
        TEST_DATA.VALID_LOAN_SMALL,
        TEST_DATA.VALID_LOAN_AUTO_APPROVE,
        TEST_DATA.VALID_LOAN_LARGE,
      ];

      for (const loan of loans) {
        await loanApp.form.createLoanApplication(
          loan.name,
          loan.amount,
          loan.term,
          loan.rate
        );
      }

      // Verify all loans were created
      await loanApp.list.expectLoanCount(loans.length);
      await loanApp.summary.expectTotalApplications(loans.length);
    });

    test('should handle multiple status changes', async () => {
      const loanData = TEST_DATA.VALID_LOAN_SMALL;

      // Create loan
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );

      // Approve loan
      await loanApp.list.approveLoan(0);
      await loanApp.list.expectLoanStatus('approved', 0);

      // Note: Once approved, status cannot be changed back
      // This is by design - verify action buttons are not visible
      await loanApp.list.expectNoActionButtons(0);
    });
  });
});
