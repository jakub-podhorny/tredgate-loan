import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { TEXT } from '../data/text-library';

/**
 * Loan List Page Object - Represents the loan applications table
 * Follows Page Object Model pattern with atomic methods and grouped actions
 */
export class LoanListPage extends BasePage {
  // Locators
  private readonly listTitle: Locator;
  private readonly emptyMessage: Locator;
  private readonly loanTable: Locator;
  private readonly tableHeaders: Locator;
  private readonly tableRows: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.listTitle = page.getByRole('heading', { name: TEXT.SECTION_LOAN_APPLICATIONS });
    this.emptyMessage = page.getByText(TEXT.MSG_NO_LOANS);
    this.loanTable = page.locator('table');
    this.tableHeaders = page.locator('thead th');
    this.tableRows = page.locator('tbody tr');
  }

  // ========== Atomic Methods ==========

  /**
   * Get loan row by index (0-based)
   */
  private getLoanRow(index: number): Locator {
    return this.tableRows.nth(index);
  }

  /**
   * Get approve button for a loan by row index
   */
  private getApproveButton(rowIndex: number): Locator {
    return this.getLoanRow(rowIndex).getByRole('button', { name: TEXT.BTN_APPROVE });
  }

  /**
   * Get reject button for a loan by row index
   */
  private getRejectButton(rowIndex: number): Locator {
    return this.getLoanRow(rowIndex).getByRole('button', { name: TEXT.BTN_REJECT });
  }

  /**
   * Get auto-decide button for a loan by row index
   */
  private getAutoDecideButton(rowIndex: number): Locator {
    return this.getLoanRow(rowIndex).getByRole('button', { name: TEXT.BTN_AUTO_DECIDE });
  }

  /**
   * Get delete button for a loan by row index
   */
  private getDeleteButton(rowIndex: number): Locator {
    return this.getLoanRow(rowIndex).getByRole('button', { name: TEXT.BTN_DELETE });
  }

  /**
   * Get loan status badge by row index
   */
  private getStatusBadge(rowIndex: number): Locator {
    return this.getLoanRow(rowIndex).locator('.status-badge');
  }

  /**
   * Get loan cell by row index and column name
   */
  private async getLoanCell(rowIndex: number, columnName: string): Promise<Locator> {
    const row = this.getLoanRow(rowIndex);
    const cells = row.locator('td');
    
    // Get header index to match the cell
    const headers = await this.tableHeaders.allTextContents();
    const columnIndex = headers.indexOf(columnName);
    
    if (columnIndex === -1) {
      throw new Error(`Column "${columnName}" not found in table headers`);
    }
    
    return cells.nth(columnIndex);
  }

  /**
   * Click approve button for a loan
   */
  async clickApprove(rowIndex: number = 0): Promise<void> {
    await this.getApproveButton(rowIndex).click();
  }

  /**
   * Click reject button for a loan
   */
  async clickReject(rowIndex: number = 0): Promise<void> {
    await this.getRejectButton(rowIndex).click();
  }

  /**
   * Click auto-decide button for a loan
   */
  async clickAutoDecide(rowIndex: number = 0): Promise<void> {
    await this.getAutoDecideButton(rowIndex).click();
  }

  /**
   * Click delete button for a loan
   */
  async clickDelete(rowIndex: number = 0): Promise<void> {
    await this.getDeleteButton(rowIndex).click();
  }

  /**
   * Get number of loan rows
   */
  async getLoanCount(): Promise<number> {
    return await this.tableRows.count();
  }

  /**
   * Get loan applicant name by row index
   */
  async getLoanApplicantName(rowIndex: number = 0): Promise<string> {
    const cell = await this.getLoanCell(rowIndex, TEXT.HEADER_APPLICANT);
    return await cell.textContent() || '';
  }

  /**
   * Get loan amount by row index
   */
  async getLoanAmount(rowIndex: number = 0): Promise<string> {
    const cell = await this.getLoanCell(rowIndex, TEXT.HEADER_AMOUNT);
    return await cell.textContent() || '';
  }

  /**
   * Get loan term by row index
   */
  async getLoanTerm(rowIndex: number = 0): Promise<string> {
    const cell = await this.getLoanCell(rowIndex, TEXT.HEADER_TERM);
    return await cell.textContent() || '';
  }

  /**
   * Get loan rate by row index
   */
  async getLoanRate(rowIndex: number = 0): Promise<string> {
    const cell = await this.getLoanCell(rowIndex, TEXT.HEADER_RATE);
    return await cell.textContent() || '';
  }

  /**
   * Get loan monthly payment by row index
   */
  async getLoanMonthlyPayment(rowIndex: number = 0): Promise<string> {
    const cell = await this.getLoanCell(rowIndex, TEXT.HEADER_MONTHLY_PAYMENT);
    return await cell.textContent() || '';
  }

  /**
   * Get loan status by row index
   */
  async getLoanStatus(rowIndex: number = 0): Promise<string> {
    return await this.getStatusBadge(rowIndex).textContent() || '';
  }

  // ========== Grouped Actions (with test.step) ==========

  /**
   * Approve a loan application by row index
   */
  async approveLoan(rowIndex: number = 0): Promise<void> {
    await this.page.evaluate(() => console.log('[Test Step] Approving loan'));
    await this.clickApprove(rowIndex);
    // Wait for the UI to update after approval
    await this.page.waitForTimeout(100);
    await this.page.evaluate(() => console.log('[Test Step] Loan approved'));
  }

  /**
   * Reject a loan application by row index
   */
  async rejectLoan(rowIndex: number = 0): Promise<void> {
    await this.page.evaluate(() => console.log('[Test Step] Rejecting loan'));
    await this.clickReject(rowIndex);
    // Wait for the UI to update after rejection
    await this.page.waitForTimeout(100);
    await this.page.evaluate(() => console.log('[Test Step] Loan rejected'));
  }

  /**
   * Auto-decide a loan application by row index
   */
  async autoDecideLoan(rowIndex: number = 0): Promise<void> {
    await this.page.evaluate(() => console.log('[Test Step] Auto-deciding loan'));
    await this.clickAutoDecide(rowIndex);
    // Wait for the UI to update after auto-decide
    await this.page.waitForTimeout(100);
    await this.page.evaluate(() => console.log('[Test Step] Loan auto-decided'));
  }

  /**
   * Delete a loan application by row index
   */
  async deleteLoan(rowIndex: number = 0): Promise<void> {
    await this.page.evaluate(() => console.log('[Test Step] Deleting loan'));
    await this.clickDelete(rowIndex);
    // Wait for the UI to update after deletion
    await this.page.waitForTimeout(100);
    await this.page.evaluate(() => console.log('[Test Step] Loan deleted'));
  }

  // ========== Assertions (expects inside Page Object) ==========

  /**
   * Verify loan list is visible
   */
  async expectListVisible(): Promise<void> {
    await expect(this.listTitle, 'Loan list title should be visible').toBeVisible();
  }

  /**
   * Verify empty message is displayed when no loans exist
   */
  async expectEmptyMessage(): Promise<void> {
    await expect(this.emptyMessage, 'Empty message should be displayed when no loans exist').toBeVisible();
    await expect(this.loanTable, 'Loan table should not be visible when no loans exist').not.toBeVisible();
  }

  /**
   * Verify loan table is displayed
   */
  async expectTableVisible(): Promise<void> {
    await expect(this.loanTable, 'Loan table should be visible').toBeVisible();
    await expect(this.emptyMessage, 'Empty message should not be visible when loans exist').not.toBeVisible();
  }

  /**
   * Verify loan count matches expected number
   */
  async expectLoanCount(expectedCount: number): Promise<void> {
    await expect(this.tableRows, `Should have ${expectedCount} loan(s) in the table`).toHaveCount(expectedCount);
  }

  /**
   * Verify loan status
   */
  async expectLoanStatus(status: string, rowIndex: number = 0): Promise<void> {
    await expect(
      this.getStatusBadge(rowIndex), 
      `Loan at row ${rowIndex} should have status "${status}"`
    ).toHaveText(status);
  }

  /**
   * Verify approve button is visible for a loan
   */
  async expectApproveButtonVisible(rowIndex: number = 0): Promise<void> {
    await expect(
      this.getApproveButton(rowIndex), 
      `Approve button should be visible for loan at row ${rowIndex}`
    ).toBeVisible();
  }

  /**
   * Verify reject button is visible for a loan
   */
  async expectRejectButtonVisible(rowIndex: number = 0): Promise<void> {
    await expect(
      this.getRejectButton(rowIndex), 
      `Reject button should be visible for loan at row ${rowIndex}`
    ).toBeVisible();
  }

  /**
   * Verify auto-decide button is visible for a loan
   */
  async expectAutoDecideButtonVisible(rowIndex: number = 0): Promise<void> {
    await expect(
      this.getAutoDecideButton(rowIndex), 
      `Auto-decide button should be visible for loan at row ${rowIndex}`
    ).toBeVisible();
  }

  /**
   * Verify delete button is visible for a loan
   */
  async expectDeleteButtonVisible(rowIndex: number = 0): Promise<void> {
    await expect(
      this.getDeleteButton(rowIndex), 
      `Delete button should be visible for loan at row ${rowIndex}`
    ).toBeVisible();
  }

  /**
   * Verify action buttons are NOT visible for a loan (e.g., approved/rejected loans)
   */
  async expectNoActionButtons(rowIndex: number = 0): Promise<void> {
    await expect(
      this.getApproveButton(rowIndex), 
      `Approve button should not be visible for loan at row ${rowIndex}`
    ).not.toBeVisible();
    
    await expect(
      this.getRejectButton(rowIndex), 
      `Reject button should not be visible for loan at row ${rowIndex}`
    ).not.toBeVisible();
    
    await expect(
      this.getAutoDecideButton(rowIndex), 
      `Auto-decide button should not be visible for loan at row ${rowIndex}`
    ).not.toBeVisible();
  }

  /**
   * Verify loan data in a specific row
   */
  async expectLoanData(
    rowIndex: number,
    expectedData: {
      applicant?: string;
      amount?: string;
      term?: string;
      rate?: string;
      status?: string;
    }
  ): Promise<void> {
    if (expectedData.applicant) {
      const applicant = await this.getLoanApplicantName(rowIndex);
      expect(applicant, `Loan applicant at row ${rowIndex} should be "${expectedData.applicant}"`).toBe(expectedData.applicant);
    }

    if (expectedData.amount) {
      const amount = await this.getLoanAmount(rowIndex);
      expect(amount, `Loan amount at row ${rowIndex} should be "${expectedData.amount}"`).toBe(expectedData.amount);
    }

    if (expectedData.term) {
      const term = await this.getLoanTerm(rowIndex);
      expect(term, `Loan term at row ${rowIndex} should be "${expectedData.term}"`).toBe(expectedData.term);
    }

    if (expectedData.rate) {
      const rate = await this.getLoanRate(rowIndex);
      expect(rate, `Loan rate at row ${rowIndex} should be "${expectedData.rate}"`).toBe(expectedData.rate);
    }

    if (expectedData.status) {
      await this.expectLoanStatus(expectedData.status, rowIndex);
    }
  }
}
