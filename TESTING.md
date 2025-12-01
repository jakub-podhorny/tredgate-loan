# Testing Documentation

## Overview

This document describes the testing setup, test coverage, and how to run tests for the Tredgate Loan application.

## Test Framework

The project uses **Vitest** for unit testing, which provides:
- Fast execution with Vite's transformation pipeline
- Jest-compatible API
- Built-in TypeScript support
- Vue component testing via @vue/test-utils

## Test Structure

Tests are located in the `tests/` directory:

```
tests/
├── loanService.test.ts    # Service layer tests (19 tests)
├── LoanForm.test.ts       # LoanForm component tests (10 tests)
├── LoanList.test.ts       # LoanList component tests (16 tests)
└── LoanSummary.test.ts    # LoanSummary component tests (12 tests)
```

**Total Test Coverage**: 57 tests across 4 test suites

## Test Categories

### 1. Service Layer Tests (`loanService.test.ts`)

Tests all business logic functions:

- **getLoans()**: Loading loans from localStorage
- **saveLoans()**: Persisting loans to localStorage
- **createLoanApplication()**: Creating new loan applications with validation
- **updateLoanStatus()**: Updating loan status
- **calculateMonthlyPayment()**: Monthly payment calculations
- **autoDecideLoan()**: Automated loan decision logic

### 2. LoanForm Component Tests (`LoanForm.test.ts`)

Tests the loan application form component:

- Form rendering and field presence
- Input validation (empty name, invalid amounts, negative rates)
- Form submission with valid data
- Event emission on successful creation
- Form reset after submission
- Error handling and display

### 3. LoanList Component Tests (`LoanList.test.ts`)

Tests the loan listing component:

- Empty state display
- Table rendering with data
- Loan detail formatting (currency, percentage, dates)
- Monthly payment calculations
- Status badge display
- Action button visibility based on loan status
- Event emission for approve/reject/autoDecide actions

### 4. LoanSummary Component Tests (`LoanSummary.test.ts`)

Tests the summary statistics component:

- Statistics calculation (total, pending, approved, rejected)
- Total approved amount calculation
- Empty state handling
- Currency formatting
- CSS class application

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

This generates:
- Terminal coverage report
- HTML coverage report in `coverage/` directory
- JSON coverage data

### Generate HTML Test Report

```bash
npm run test:report
```

This:
1. Runs all tests
2. Generates `test-results.json`
3. Creates `test-report.html` with visual test results

## Test Reports

### HTML Test Report

The HTML report (`test-report.html`) provides:
- Visual overview of test results
- Test suite breakdown
- Individual test status
- Pass/fail statistics
- Execution time
- Beautiful, responsive UI

**To view**: Open `test-report.html` in your browser after running `npm run test:report`

### JSON Test Results

The `test-results.json` file contains:
- Detailed test execution data
- Test suite information
- Individual test results
- Timing information
- Success/failure status

## GitHub Actions Integration

Tests run automatically on:
- Pull requests to `main` branch
- Pushes to `main` branch

The CI workflow:
1. Runs linter
2. Executes all tests
3. Generates HTML test report
4. Uploads test artifacts
5. Creates workflow summary with test statistics
6. Builds the application

### Artifacts

After each workflow run, you can download:
- **test-report**: HTML test report (`test-report.html`)
- **test-results**: JSON test data (`test-results.json`)

Artifacts are retained for 30 days.

### Workflow Summary

Each workflow run includes a summary with:
- Overall test status (✅/❌)
- Test statistics table (passed, failed, skipped, total)
- Link to download detailed HTML report

## Writing New Tests

### Test File Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import YourComponent from '../src/components/YourComponent.vue'

describe('YourComponent', () => {
  beforeEach(() => {
    // Setup before each test
  })

  it('should do something', () => {
    const wrapper = mount(YourComponent, {
      props: { /* ... */ }
    })
    
    expect(wrapper.find('.selector').text()).toBe('expected')
  })
})
```

### Best Practices

1. **Keep tests focused**: Each test should verify one specific behavior
2. **Use descriptive names**: Test names should clearly describe what they test
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
4. **Mock external dependencies**: Use `vi.fn()` and `vi.spyOn()` for mocking
5. **Test user behavior**: Focus on what users see and do, not implementation details
6. **Clean up**: Use `beforeEach` to reset state between tests

### Mocking localStorage

All tests mock localStorage to avoid side effects:

```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    // ... other methods
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })
```

## Coverage Goals

Current coverage targets:
- **Statements**: > 80%
- **Branches**: > 80%
- **Functions**: > 80%
- **Lines**: > 80%

Run `npm run test:coverage` to see detailed coverage report.

## Troubleshooting

### Tests failing locally but passing in CI

- Ensure you have the latest dependencies: `npm install`
- Clear cache: `rm -rf node_modules/.vite`
- Check Node.js version matches CI (use `nvm use lts/*`)

### Mock not working

- Ensure mocks are defined before imports
- Clear mocks between tests: `vi.clearAllMocks()`
- Check mock implementation is correct

### Component tests failing

- Verify component props are correctly passed
- Check if async operations need `await`
- Ensure DOM elements exist before assertions

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils Documentation](https://test-utils.vuejs.org/)
- [Testing Best Practices](https://testingjavascript.com/)
