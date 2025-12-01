import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { TEXT } from '../data/text-library';

/**
 * Loan Summary Page Object - Represents the summary statistics section
 * Follows Page Object Model pattern with atomic methods and grouped actions
 */
export class LoanSummaryPage extends BasePage {
  // Locators
  private readonly summaryContainer: Locator;

  constructor(page: Page) {
    super(page);
    
    // The summary section doesn't have a unique identifier, using class-based selector
    // Note: This is not ideal - should be added to the component in the future
    this.summaryContainer = page.locator('.loan-summary, [class*="summary"]').first();
  }

  // ========== Atomic Methods ==========

  /**
   * Get a summary stat by label
   */
  private getSummaryStatByLabel(label: string): Locator {
    // Find the element containing the label text, then get its sibling or parent's value element
    return this.page.getByText(label).locator('..');
  }

  /**
   * Get total applications count
   */
  async getTotalApplications(): Promise<string> {
    const stat = this.getSummaryStatByLabel(TEXT.SUMMARY_TOTAL_APPLICATIONS);
    // Get the numeric value which should be in the first div/span
    const value = await stat.locator('div, span').first().textContent();
    return value?.trim() || '';
  }

  /**
   * Get pending loans count
   */
  async getPendingCount(): Promise<string> {
    const stat = this.getSummaryStatByLabel(TEXT.SUMMARY_PENDING);
    const value = await stat.locator('div, span').first().textContent();
    return value?.trim() || '';
  }

  /**
   * Get approved loans count
   */
  async getApprovedCount(): Promise<string> {
    const stat = this.getSummaryStatByLabel(TEXT.SUMMARY_APPROVED);
    const value = await stat.locator('div, span').first().textContent();
    return value?.trim() || '';
  }

  /**
   * Get rejected loans count
   */
  async getRejectedCount(): Promise<string> {
    const stat = this.getSummaryStatByLabel(TEXT.SUMMARY_REJECTED);
    const value = await stat.locator('div, span').first().textContent();
    return value?.trim() || '';
  }

  /**
   * Get total approved amount
   */
  async getTotalApprovedAmount(): Promise<string> {
    const stat = this.getSummaryStatByLabel(TEXT.SUMMARY_TOTAL_APPROVED);
    const value = await stat.locator('div, span').first().textContent();
    return value?.trim() || '';
  }

  // ========== Assertions (expects inside Page Object) ==========

  /**
   * Verify total applications count
   */
  async expectTotalApplications(expectedCount: number): Promise<void> {
    const actual = await this.getTotalApplications();
    expect(
      parseInt(actual), 
      `Total applications should be ${expectedCount}`
    ).toBe(expectedCount);
  }

  /**
   * Verify pending loans count
   */
  async expectPendingCount(expectedCount: number): Promise<void> {
    const actual = await this.getPendingCount();
    expect(
      parseInt(actual), 
      `Pending loans count should be ${expectedCount}`
    ).toBe(expectedCount);
  }

  /**
   * Verify approved loans count
   */
  async expectApprovedCount(expectedCount: number): Promise<void> {
    const actual = await this.getApprovedCount();
    expect(
      parseInt(actual), 
      `Approved loans count should be ${expectedCount}`
    ).toBe(expectedCount);
  }

  /**
   * Verify rejected loans count
   */
  async expectRejectedCount(expectedCount: number): Promise<void> {
    const actual = await this.getRejectedCount();
    expect(
      parseInt(actual), 
      `Rejected loans count should be ${expectedCount}`
    ).toBe(expectedCount);
  }

  /**
   * Verify total approved amount
   */
  async expectTotalApprovedAmount(expectedAmount: string): Promise<void> {
    const actual = await this.getTotalApprovedAmount();
    expect(
      actual, 
      `Total approved amount should be ${expectedAmount}`
    ).toBe(expectedAmount);
  }

  /**
   * Verify all summary stats at once
   */
  async expectSummaryStats(expected: {
    total?: number;
    pending?: number;
    approved?: number;
    rejected?: number;
    totalApprovedAmount?: string;
  }): Promise<void> {
    if (expected.total !== undefined) {
      await this.expectTotalApplications(expected.total);
    }
    if (expected.pending !== undefined) {
      await this.expectPendingCount(expected.pending);
    }
    if (expected.approved !== undefined) {
      await this.expectApprovedCount(expected.approved);
    }
    if (expected.rejected !== undefined) {
      await this.expectRejectedCount(expected.rejected);
    }
    if (expected.totalApprovedAmount !== undefined) {
      await this.expectTotalApprovedAmount(expected.totalApprovedAmount);
    }
  }

  /**
   * Verify initial state (all zeros)
   */
  async expectInitialState(): Promise<void> {
    await this.expectSummaryStats({
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalApprovedAmount: '$0'
    });
  }
}
