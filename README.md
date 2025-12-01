# Tredgate Loan

A simple loan application management demo built with Vue 3, TypeScript, and Vite.

## Overview

Tredgate Loan is a frontend-only demo application used for training on GitHub Copilot features. It demonstrates a small, realistic frontend project without any backend server or external database.

## Features

- Create loan applications with applicant name, amount, term, and interest rate
- View all loan applications in a table
- Approve or reject loan applications manually
- Auto-decide loans based on simple business rules:
  - Approved if amount ≤ $100,000 AND term ≤ 60 months
  - Rejected otherwise
- Calculate monthly payments
- View summary statistics
- **Audit Log** - Track all loan application changes with comprehensive audit trail:
  - Records loan creation, status changes (manual/auto), and deletions
  - Filter by action type
  - Search by applicant name or loan ID
  - View complete event history in reverse chronological order

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Vitest** - Unit testing framework
- **ESLint** - Code linting

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

Run all tests:
```bash
npm run test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Generate HTML test report:
```bash
npm run test:report
```

For detailed testing documentation, see [TESTING.md](./TESTING.md).

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── assets/           # Global CSS styles
├── components/       # Vue components
│   ├── AuditLogViewer.vue  # Audit log display
│   ├── LoanForm.vue        # Form to create new loans
│   ├── LoanList.vue        # Table of loan applications
│   └── LoanSummary.vue     # Statistics display
├── services/         # Business logic
│   ├── auditLogService.ts  # Audit log operations
│   └── loanService.ts      # Loan operations
├── types/            # TypeScript definitions
│   ├── auditLog.ts         # Audit log domain types
│   └── loan.ts             # Loan domain types
├── App.vue           # Main application component
└── main.ts           # Application entry point
tests/
├── auditLogService.test.ts  # Audit log service tests
├── loanService.test.ts      # Service layer tests
├── LoanForm.test.ts         # LoanForm component tests
├── LoanList.test.ts         # LoanList component tests
└── LoanSummary.test.ts      # LoanSummary component tests
scripts/
└── generate-html-report.js  # Test report generator
```

## Data Persistence

All data is stored in the browser's localStorage. No backend server or external database is used.

- **Loan applications**: stored under key `tredgate_loans`
- **Audit logs**: stored under key `tredgate_audit_logs`

## Audit Log

The audit log feature provides complete traceability of all loan application changes.

### Accessing the Audit Log

Click the **Audit Log** button in the top navigation to view the audit log screen.

### Data Structure

Each audit log entry contains:

- **id**: Unique identifier for the log entry
- **timestamp**: ISO 8601 timestamp of when the event occurred
- **actionType**: Type of action performed
  - `loan_created` - A new loan application was created
  - `status_changed_manual` - Loan status changed by manual approval/rejection
  - `status_changed_auto` - Loan status changed by auto-decide feature
  - `loan_deleted` - Loan application was deleted
- **loanId**: ID of the affected loan application
- **applicantName**: Name of the loan applicant
- **loanAmount**: Loan amount
- **previousStatus**: Status before the change (for status changes and deletions)
- **newStatus**: Status after the change (for status changes)
- **decisionMethod**: 'manual' or 'auto' (for status changes)

### Using the Audit Log

1. **View All Logs**: By default, all audit log entries are displayed in reverse chronological order (newest first)

2. **Filter by Action Type**: Use the "Filter by Action" dropdown to show only specific event types:
   - All Actions (default)
   - Loan Created
   - Status Changed (Manual)
   - Status Changed (Auto)
   - Loan Deleted

3. **Search**: Use the search box to find entries by:
   - Applicant name (case-insensitive)
   - Loan ID

4. **Color-Coded Actions**: Each action type has a distinct color badge for quick visual scanning:
   - 🟢 **Loan Created** (green)
   - 🔵 **Status Changed (Manual)** (blue)
   - 🟠 **Status Changed (Auto)** (orange)
   - 🔴 **Loan Deleted** (red)

5. **Refresh**: Click the "Refresh" button to reload the audit log from localStorage

### Example Entries

```
Timestamp: Dec 1, 2025, 12:38:31 PM
Action: Status Changed (Manual)
Applicant: John Smith
Loan ID: min4xna5wd7xs0g
Amount: $50,000.00
Details: pending → approved
```

## Testing

The project has comprehensive test coverage with 87 tests across:
- Service layer (51 tests: 23 loan service + 28 audit log service)
- Vue components (38 tests)

Tests use Vitest and @vue/test-utils. HTML test reports are automatically generated and can be viewed in your browser.

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## CI/CD

GitHub Actions workflow runs on all pull requests to `main`:
- Linting
- All tests
- HTML report generation
- Artifact uploads
- Build verification

Test reports are available as workflow artifacts.

## License

MIT
