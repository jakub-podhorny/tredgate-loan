import { test } from '@playwright/test';
import { LoanAppPage } from '../page-objects/loan-app.page';
import { clearLocalStorage, formatCurrency } from '../helpers/test-helpers';
import { TEXT, TEST_DATA } from '../data/text-library';

/**
 * Loan Actions Tests - Approve, Reject, Auto-decide, Delete
 * These tests verify loan status changes and deletions
 */

test.describe('Loan Actions', () => {
  let loanApp: LoanAppPage;

  test.beforeEach(async ({ page }) => {
    loanApp = new LoanAppPage(page);
    await loanApp.goto();
    await clearLocalStorage(page);
    await loanApp.reload();
  });

  test.describe('Approve Loan', () => {
    test('should approve a pending loan', async () => {
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

      // Verify status changed to approved
      await loanApp.list.expectLoanStatus(TEXT.STATUS_APPROVED, 0);

      // Verify summary updated
      await loanApp.summary.expectSummaryStats({
        total: 1,
        pending: 0,
        approved: 1,
        rejected: 0,
        totalApprovedAmount: formatCurrency(parseFloat(loanData.amount))
      });

      // Verify action buttons are no longer visible
      await loanApp.list.expectNoActionButtons(0);
    });

    test('should update total approved amount when approving multiple loans', async () => {
      const loan1 = TEST_DATA.VALID_LOAN_SMALL;
      const loan2 = TEST_DATA.VALID_LOAN_AUTO_APPROVE;

      // Create two loans
      await loanApp.form.createLoanApplication(loan1.name, loan1.amount, loan1.term, loan1.rate);
      await loanApp.form.createLoanApplication(loan2.name, loan2.amount, loan2.term, loan2.rate);

      // Approve both loans
      await loanApp.list.approveLoan(0);
      await loanApp.list.approveLoan(1);

      // Calculate expected total
      const totalAmount = parseFloat(loan1.amount) + parseFloat(loan2.amount);

      // Verify summary
      await loanApp.summary.expectSummaryStats({
        total: 2,
        pending: 0,
        approved: 2,
        rejected: 0,
        totalApprovedAmount: formatCurrency(totalAmount)
      });
    });
  });

  test.describe('Reject Loan', () => {
    test('should reject a pending loan', async () => {
      const loanData = TEST_DATA.VALID_LOAN_SMALL;

      // Create loan
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );

      // Reject loan
      await loanApp.list.rejectLoan(0);

      // Verify status changed to rejected
      await loanApp.list.expectLoanStatus(TEXT.STATUS_REJECTED, 0);

      // Verify summary updated
      await loanApp.summary.expectSummaryStats({
        total: 1,
        pending: 0,
        approved: 0,
        rejected: 1,
        totalApprovedAmount: '$0'
      });

      // Verify action buttons are no longer visible
      await loanApp.list.expectNoActionButtons(0);
    });

    test('should not add to total approved amount when rejecting', async () => {
      const loanData = TEST_DATA.VALID_LOAN_SMALL;

      // Create loan
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );

      // Reject loan
      await loanApp.list.rejectLoan(0);

      // Verify total approved amount remains $0
      await loanApp.summary.expectTotalApprovedAmount('$0');
    });
  });

  test.describe('Auto-decide Loan', () => {
    test('should auto-approve loan when amount ≤ $100,000 AND term ≤ 60 months', async () => {
      const loanData = TEST_DATA.VALID_LOAN_AUTO_APPROVE; // $90,000, 48 months

      // Create loan
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );

      // Auto-decide loan
      await loanApp.list.autoDecideLoan(0);

      // Verify status changed to approved
      await loanApp.list.expectLoanStatus(TEXT.STATUS_APPROVED, 0);

      // Verify summary
      await loanApp.summary.expectSummaryStats({
        total: 1,
        pending: 0,
        approved: 1,
        rejected: 0,
        totalApprovedAmount: formatCurrency(parseFloat(loanData.amount))
      });
    });

    test('should auto-reject loan when amount > $100,000', async () => {
      const loanData = TEST_DATA.VALID_LOAN_AUTO_REJECT; // $110,000, 70 months

      // Create loan
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );

      // Auto-decide loan
      await loanApp.list.autoDecideLoan(0);

      // Verify status changed to rejected
      await loanApp.list.expectLoanStatus(TEXT.STATUS_REJECTED, 0);

      // Verify summary
      await loanApp.summary.expectSummaryStats({
        total: 1,
        pending: 0,
        approved: 0,
        rejected: 1,
        totalApprovedAmount: '$0'
      });
    });

    test('should auto-reject loan when term > 60 months', async () => {
      const loanData = TEST_DATA.VALID_LOAN_LARGE; // $150,000, 72 months

      // Create loan
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );

      // Auto-decide loan
      await loanApp.list.autoDecideLoan(0);

      // Verify status changed to rejected
      await loanApp.list.expectLoanStatus(TEXT.STATUS_REJECTED, 0);
    });
  });

  test.describe('Delete Loan', () => {
    test('should delete a pending loan', async () => {
      const loanData = TEST_DATA.VALID_LOAN_SMALL;

      // Create loan
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );

      // Verify loan exists
      await loanApp.list.expectLoanCount(1);

      // Delete loan
      await loanApp.list.deleteLoan(0);

      // Verify loan is removed from list
      await loanApp.list.expectEmptyMessage();
      await loanApp.list.expectLoanCount(0);

      // Verify summary reset to zero
      await loanApp.summary.expectInitialState();
    });

    test('should delete an approved loan', async () => {
      const loanData = TEST_DATA.VALID_LOAN_SMALL;

      // Create and approve loan
      await loanApp.form.createLoanApplication(
        loanData.name,
        loanData.amount,
        loanData.term,
        loanData.rate
      );
      await loanApp.list.approveLoan(0);

      // Delete loan
      await loanApp.list.deleteLoan(0);

      // Verify loan is removed and summary reset
      await loanApp.list.expectEmptyMessage();
      await loanApp.summary.expectInitialState();
    });

    test('should delete only the selected loan when multiple exist', async () => {
      const loan1 = TEST_DATA.VALID_LOAN_SMALL;
      const loan2 = TEST_DATA.VALID_LOAN_LARGE;

      // Create two loans
      await loanApp.form.createLoanApplication(loan1.name, loan1.amount, loan1.term, loan1.rate);
      await loanApp.form.createLoanApplication(loan2.name, loan2.amount, loan2.term, loan2.rate);

      // Verify both exist
      await loanApp.list.expectLoanCount(2);

      // Delete first loan
      await loanApp.list.deleteLoan(0);

      // Verify only one loan remains
      await loanApp.list.expectLoanCount(1);
      
      // Verify the remaining loan is the second one
      await loanApp.list.expectLoanData(0, {
        applicant: loan2.name
      });

      // Verify summary updated
      await loanApp.summary.expectSummaryStats({
        total: 1,
        pending: 1
      });
    });
  });
});
