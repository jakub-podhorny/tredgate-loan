/**
 * Text Library - Centralized text constants for Playwright tests
 * This ensures consistency and makes test maintenance easier
 */

export const TEXT = {
  // Page elements
  APP_TITLE: 'Tredgate Loan',
  APP_TAGLINE: 'Simple loan application management',
  
  // Form labels
  FORM_TITLE: 'New Loan Application',
  LABEL_APPLICANT_NAME: 'Applicant Name',
  LABEL_LOAN_AMOUNT: 'Loan Amount ($)',
  LABEL_TERM: 'Term (Months)',
  LABEL_INTEREST_RATE: 'Interest Rate (e.g., 0.08 for 8%)',
  
  // Placeholders
  PLACEHOLDER_APPLICANT_NAME: 'Enter applicant name',
  
  // Buttons
  BTN_CREATE_APPLICATION: 'Create Application',
  BTN_APPROVE: '✓',
  BTN_REJECT: '✗',
  BTN_AUTO_DECIDE: '⚡',
  BTN_DELETE: 'Delete loan application',
  
  // Table headers
  HEADER_APPLICANT: 'Applicant',
  HEADER_AMOUNT: 'Amount',
  HEADER_TERM: 'Term',
  HEADER_RATE: 'Rate',
  HEADER_MONTHLY_PAYMENT: 'Monthly Payment',
  HEADER_STATUS: 'Status',
  HEADER_CREATED: 'Created',
  HEADER_ACTIONS: 'Actions',
  
  // Loan statuses
  STATUS_PENDING: 'pending',
  STATUS_APPROVED: 'approved',
  STATUS_REJECTED: 'rejected',
  
  // Summary labels
  SUMMARY_TOTAL_APPLICATIONS: 'Total Applications',
  SUMMARY_PENDING: 'Pending',
  SUMMARY_APPROVED: 'Approved',
  SUMMARY_REJECTED: 'Rejected',
  SUMMARY_TOTAL_APPROVED: 'Total Approved',
  
  // Messages
  MSG_NO_LOANS: 'No loan applications yet. Create one using the form.',
  
  // Section titles
  SECTION_LOAN_APPLICATIONS: 'Loan Applications',
};

export const TEST_DATA = {
  // Valid loan applications
  VALID_LOAN_SMALL: {
    name: 'John Doe',
    amount: '50000',
    term: '36',
    rate: '0.08',
  },
  
  VALID_LOAN_LARGE: {
    name: 'Jane Smith',
    amount: '150000',
    term: '72',
    rate: '0.06',
  },
  
  VALID_LOAN_AUTO_APPROVE: {
    name: 'Bob Johnson',
    amount: '90000',
    term: '48',
    rate: '0.05',
  },
  
  VALID_LOAN_AUTO_REJECT: {
    name: 'Alice Williams',
    amount: '110000',
    term: '70',
    rate: '0.07',
  },
  
  // Invalid loan applications for edge case testing
  INVALID_EMPTY_NAME: {
    name: '',
    amount: '50000',
    term: '36',
    rate: '0.08',
  },
  
  INVALID_ZERO_AMOUNT: {
    name: 'Test User',
    amount: '0',
    term: '36',
    rate: '0.08',
  },
  
  INVALID_NEGATIVE_AMOUNT: {
    name: 'Test User',
    amount: '-1000',
    term: '36',
    rate: '0.08',
  },
  
  INVALID_ZERO_TERM: {
    name: 'Test User',
    amount: '50000',
    term: '0',
    rate: '0.08',
  },
  
  INVALID_NEGATIVE_RATE: {
    name: 'Test User',
    amount: '50000',
    term: '36',
    rate: '-0.05',
  },
};
