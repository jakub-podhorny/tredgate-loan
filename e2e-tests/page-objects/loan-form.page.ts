import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { TEXT } from '../data/text-library';

/**
 * Loan Form Page Object - Represents the loan application form
 * Follows Page Object Model pattern with atomic methods and grouped actions
 */
export class LoanFormPage extends BasePage {
  // Locators
  private readonly formTitle: Locator;
  private readonly applicantNameInput: Locator;
  private readonly loanAmountInput: Locator;
  private readonly termInput: Locator;
  private readonly interestRateInput: Locator;
  private readonly createButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators using accessible role-based selectors
    this.formTitle = page.getByRole('heading', { name: TEXT.FORM_TITLE });
    this.applicantNameInput = page.getByRole('textbox', { name: TEXT.LABEL_APPLICANT_NAME });
    this.loanAmountInput = page.getByRole('spinbutton', { name: TEXT.LABEL_LOAN_AMOUNT });
    this.termInput = page.getByRole('spinbutton', { name: TEXT.LABEL_TERM });
    this.interestRateInput = page.getByRole('spinbutton', { name: TEXT.LABEL_INTEREST_RATE });
    this.createButton = page.getByRole('button', { name: TEXT.BTN_CREATE_APPLICATION });
  }

  // ========== Atomic Methods ==========
  
  /**
   * Fill applicant name field
   */
  async fillApplicantName(name: string): Promise<void> {
    await this.applicantNameInput.fill(name);
  }

  /**
   * Fill loan amount field
   */
  async fillLoanAmount(amount: string): Promise<void> {
    await this.loanAmountInput.fill(amount);
  }

  /**
   * Fill term field
   */
  async fillTerm(term: string): Promise<void> {
    await this.termInput.fill(term);
  }

  /**
   * Fill interest rate field
   */
  async fillInterestRate(rate: string): Promise<void> {
    await this.interestRateInput.fill(rate);
  }

  /**
   * Click create application button
   */
  async clickCreateButton(): Promise<void> {
    await this.createButton.click();
  }

  /**
   * Get applicant name input value
   */
  async getApplicantNameValue(): Promise<string> {
    return await this.applicantNameInput.inputValue();
  }

  /**
   * Get loan amount input value
   */
  async getLoanAmountValue(): Promise<string> {
    return await this.loanAmountInput.inputValue();
  }

  /**
   * Get term input value
   */
  async getTermValue(): Promise<string> {
    return await this.termInput.inputValue();
  }

  /**
   * Get interest rate input value
   */
  async getInterestRateValue(): Promise<string> {
    return await this.interestRateInput.inputValue();
  }

  // ========== Grouped Actions (with test.step) ==========

  /**
   * Create a loan application with provided data
   * This is a grouped action that performs multiple steps
   */
  async createLoanApplication(
    applicantName: string,
    amount: string,
    term: string,
    rate: string
  ): Promise<void> {
    await this.page.evaluate(() => console.log('[Test Step] Filling loan application form'));
    
    await this.fillApplicantName(applicantName);
    await this.fillLoanAmount(amount);
    await this.fillTerm(term);
    await this.fillInterestRate(rate);
    await this.clickCreateButton();
    
    await this.page.evaluate(() => console.log('[Test Step] Loan application form submitted'));
  }

  // ========== Assertions (expects inside Page Object) ==========

  /**
   * Verify form is visible
   */
  async expectFormVisible(): Promise<void> {
    await expect(this.formTitle, 'Form title should be visible').toBeVisible();
    await expect(this.createButton, 'Create button should be visible').toBeVisible();
  }

  /**
   * Verify all form fields are visible
   */
  async expectAllFieldsVisible(): Promise<void> {
    await expect(this.applicantNameInput, 'Applicant name field should be visible').toBeVisible();
    await expect(this.loanAmountInput, 'Loan amount field should be visible').toBeVisible();
    await expect(this.termInput, 'Term field should be visible').toBeVisible();
    await expect(this.interestRateInput, 'Interest rate field should be visible').toBeVisible();
  }

  /**
   * Verify form is reset (all fields are empty)
   */
  async expectFormReset(): Promise<void> {
    await expect(this.applicantNameInput, 'Applicant name should be empty after reset').toHaveValue('');
    await expect(this.loanAmountInput, 'Loan amount should be empty after reset').toHaveValue('');
    await expect(this.termInput, 'Term should be empty after reset').toHaveValue('');
    await expect(this.interestRateInput, 'Interest rate should be empty after reset').toHaveValue('');
  }

  /**
   * Verify form field values match expected data
   */
  async expectFormValues(
    applicantName: string,
    amount: string,
    term: string,
    rate: string
  ): Promise<void> {
    await expect(this.applicantNameInput, `Applicant name should be "${applicantName}"`).toHaveValue(applicantName);
    await expect(this.loanAmountInput, `Loan amount should be "${amount}"`).toHaveValue(amount);
    await expect(this.termInput, `Term should be "${term}"`).toHaveValue(term);
    await expect(this.interestRateInput, `Interest rate should be "${rate}"`).toHaveValue(rate);
  }

  /**
   * Verify placeholder is displayed for applicant name
   */
  async expectApplicantNamePlaceholder(): Promise<void> {
    await expect(
      this.applicantNameInput, 
      `Applicant name placeholder should be "${TEXT.PLACEHOLDER_APPLICANT_NAME}"`
    ).toHaveAttribute('placeholder', TEXT.PLACEHOLDER_APPLICANT_NAME);
  }
}
