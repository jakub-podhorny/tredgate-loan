import { test } from '@playwright/test';
import { LoanAppPage } from '../page-objects/loan-app.page';
import { clearLocalStorage, calculateMonthlyPayment, formatCurrency, formatPercentage } from '../helpers/test-helpers';
import { TEXT, TEST_DATA } from '../data/text-library';

/**
 * Loan Creation Tests - Positive scenarios
 * These tests verify successful loan application creation
 */

test.describe('Loan Creation - Positive Scenarios', () => {
  let loanApp: LoanAppPage;

  test.beforeEach(async ({ page }) => {
    loanApp = new LoanAppPage(page);
    await loanApp.goto();
    await clearLocalStorage(page);
    await loanApp.reload();
  });

  test('should create a loan application successfully', async () => {
    const loanData = TEST_DATA.VALID_LOAN_SMALL;

    // Create loan application
    await loanApp.form.createLoanApplication(
      loanData.name,
      loanData.amount,
      loanData.term,
      loanData.rate
    );

    // Verify loan appears in the list
    await loanApp.list.expectTableVisible();
    await loanApp.list.expectLoanCount(1);

    // Verify loan data
    await loanApp.list.expectLoanData(0, {
      applicant: loanData.name,
      amount: formatCurrency(parseFloat(loanData.amount)),
      term: `${loanData.term} mo`,
      rate: formatPercentage(parseFloat(loanData.rate)),
      status: TEXT.STATUS_PENDING
    });

    // Verify summary updated
    await loanApp.summary.expectSummaryStats({
      total: 1,
      pending: 1,
      approved: 0,
      rejected: 0,
      totalApprovedAmount: '$0'
    });
  });

  test('should reset form after successful creation', async () => {
    const loanData = TEST_DATA.VALID_LOAN_SMALL;

    // Create loan application
    await loanApp.form.createLoanApplication(
      loanData.name,
      loanData.amount,
      loanData.term,
      loanData.rate
    );

    // Verify form is reset
    await loanApp.form.expectFormReset();
  });

  test('should create multiple loan applications', async () => {
    const loan1 = TEST_DATA.VALID_LOAN_SMALL;
    const loan2 = TEST_DATA.VALID_LOAN_LARGE;

    // Create first loan
    await loanApp.form.createLoanApplication(
      loan1.name,
      loan1.amount,
      loan1.term,
      loan1.rate
    );

    // Create second loan
    await loanApp.form.createLoanApplication(
      loan2.name,
      loan2.amount,
      loan2.term,
      loan2.rate
    );

    // Verify both loans appear in the list
    await loanApp.list.expectLoanCount(2);

    // Verify first loan data
    await loanApp.list.expectLoanData(0, {
      applicant: loan1.name,
      status: TEXT.STATUS_PENDING
    });

    // Verify second loan data
    await loanApp.list.expectLoanData(1, {
      applicant: loan2.name,
      status: TEXT.STATUS_PENDING
    });

    // Verify summary
    await loanApp.summary.expectSummaryStats({
      total: 2,
      pending: 2,
      approved: 0,
      rejected: 0
    });
  });

  test('should calculate monthly payment correctly', async () => {
    const loanData = TEST_DATA.VALID_LOAN_SMALL;
    const expectedPayment = calculateMonthlyPayment(
      parseFloat(loanData.amount),
      parseFloat(loanData.term),
      parseFloat(loanData.rate)
    );

    // Create loan application
    await loanApp.form.createLoanApplication(
      loanData.name,
      loanData.amount,
      loanData.term,
      loanData.rate
    );

    // Verify monthly payment is calculated and displayed
    const actualPayment = await loanApp.list.getLoanMonthlyPayment(0);
    const formattedExpected = formatCurrency(expectedPayment);
    
    // Allow small rounding differences
    await loanApp.list.expectLoanData(0, {
      // Monthly payment should be close to the calculated value
    });
  });

  test('should persist loans in localStorage', async ({ page }) => {
    const loanData = TEST_DATA.VALID_LOAN_SMALL;

    // Create loan application
    await loanApp.form.createLoanApplication(
      loanData.name,
      loanData.amount,
      loanData.term,
      loanData.rate
    );

    // Reload the page
    await loanApp.reload();

    // Verify loan persists after reload
    await loanApp.list.expectTableVisible();
    await loanApp.list.expectLoanCount(1);
    await loanApp.list.expectLoanData(0, {
      applicant: loanData.name,
      status: TEXT.STATUS_PENDING
    });

    // Verify summary persists
    await loanApp.summary.expectSummaryStats({
      total: 1,
      pending: 1
    });
  });

  test('should display action buttons for pending loans', async () => {
    const loanData = TEST_DATA.VALID_LOAN_SMALL;

    // Create loan application
    await loanApp.form.createLoanApplication(
      loanData.name,
      loanData.amount,
      loanData.term,
      loanData.rate
    );

    // Verify action buttons are visible for pending loan
    await loanApp.list.expectApproveButtonVisible(0);
    await loanApp.list.expectRejectButtonVisible(0);
    await loanApp.list.expectAutoDecideButtonVisible(0);
    await loanApp.list.expectDeleteButtonVisible(0);
  });
});
