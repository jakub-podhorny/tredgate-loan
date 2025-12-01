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
│   ├── LoanForm.vue     # Form to create new loans
│   ├── LoanList.vue     # Table of loan applications
│   └── LoanSummary.vue  # Statistics display
├── services/         # Business logic
│   └── loanService.ts   # Loan operations
├── types/            # TypeScript definitions
│   └── loan.ts          # Loan domain types
├── App.vue           # Main application component
└── main.ts           # Application entry point
tests/
├── loanService.test.ts  # Service layer tests
├── LoanForm.test.ts     # LoanForm component tests
├── LoanList.test.ts     # LoanList component tests
└── LoanSummary.test.ts  # LoanSummary component tests
scripts/
└── generate-html-report.js  # Test report generator
```

## Data Persistence

All data is stored in the browser's localStorage under the key `tredgate_loans`. No backend server or external database is used.

## Testing

The project has comprehensive test coverage with 57 tests across:
- Service layer (19 tests)
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
