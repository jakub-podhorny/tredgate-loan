import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { LoanFormPage } from './loan-form.page';
import { LoanListPage } from './loan-list.page';
import { LoanSummaryPage } from './loan-summary.page';
import { TEXT } from '../data/text-library';

/**
 * Main Loan Application Page Object - Combines all page components
 * This represents the entire application page
 */
export class LoanAppPage extends BasePage {
  // Component page objects
  public readonly form: LoanFormPage;
  public readonly list: LoanListPage;
  public readonly summary: LoanSummaryPage;

  constructor(page: Page) {
    super(page);
    
    // Initialize component page objects
    this.form = new LoanFormPage(page);
    this.list = new LoanListPage(page);
    this.summary = new LoanSummaryPage(page);
  }

  // ========== Page-level methods ==========

  /**
   * Navigate to the application
   */
  async goto(): Promise<void> {
    await super.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Verify page is loaded correctly
   */
  async expectPageLoaded(): Promise<void> {
    const title = await this.getTitle();
    expect(title, `Page title should be "${TEXT.APP_TITLE}"`).toBe(TEXT.APP_TITLE);
    
    // Verify main sections are visible
    await expect(
      this.page.getByRole('heading', { name: TEXT.APP_TITLE }), 
      'App title should be visible'
    ).toBeVisible();
    
    await expect(
      this.page.getByText(TEXT.APP_TAGLINE), 
      'App tagline should be visible'
    ).toBeVisible();
  }

  /**
   * Verify initial empty state of the application
   */
  async expectInitialEmptyState(): Promise<void> {
    await this.expectPageLoaded();
    await this.summary.expectInitialState();
    await this.list.expectEmptyMessage();
    await this.form.expectFormVisible();
  }
}
