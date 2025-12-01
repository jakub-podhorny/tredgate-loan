import { Page } from '@playwright/test';

/**
 * Helper functions for Playwright tests
 */

/**
 * Clear localStorage to ensure clean state for tests
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch (e) {
      // If localStorage is not accessible yet, ignore the error
      console.log('LocalStorage not accessible yet');
    }
  });
}

/**
 * Get all loans from localStorage
 */
export async function getLoansFromLocalStorage(page: Page): Promise<any[]> {
  return await page.evaluate(() => {
    const stored = localStorage.getItem('tredgate_loans');
    return stored ? JSON.parse(stored) : [];
  });
}

/**
 * Set loans in localStorage
 */
export async function setLoansInLocalStorage(page: Page, loans: any[]): Promise<void> {
  await page.evaluate((loansData) => {
    localStorage.setItem('tredgate_loans', JSON.stringify(loansData));
  }, loans);
}

/**
 * Calculate expected monthly payment
 * Formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
 * Where: P = principal, r = monthly interest rate, n = number of payments
 */
export function calculateMonthlyPayment(
  amount: number,
  termMonths: number,
  annualRate: number
): number {
  if (annualRate === 0) {
    return amount / termMonths;
  }

  const monthlyRate = annualRate / 12;
  const numerator = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths));
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  
  return numerator / denominator;
}

/**
 * Format currency for comparison
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for comparison
 */
export function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Wait for a condition with timeout
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  checkInterval: number = 100
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
  
  return false;
}
