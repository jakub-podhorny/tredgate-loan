# Playwright E2E Testing Documentation

## Overview

This document describes the end-to-end (E2E) testing setup using Playwright for the Tredgate Loan application. The tests ensure that all core user journeys and functionality work correctly from an end-user perspective.

## Test Framework

The project uses **Playwright** for E2E testing, which provides:
- Cross-browser testing support (currently configured for Chromium)
- Fast and reliable test execution
- Built-in test retry and screenshot/video capture on failure
- Rich reporting with HTML reports and traces
- TypeScript support

## Test Structure

Tests are organized in the `e2e-tests/` directory:

```
e2e-tests/
├── data/
│   └── text-library.ts         # Centralized text constants and test data
├── helpers/
│   └── test-helpers.ts         # Utility functions (localStorage, calculations)
├── page-objects/
│   ├── base-page.ts            # Base page class
│   ├── loan-app.page.ts        # Main application page
│   ├── loan-form.page.ts       # Loan form component
│   ├── loan-list.page.ts       # Loan list table component
│   └── loan-summary.page.ts    # Summary statistics component
└── tests/
    ├── 01-smoke.spec.ts         # Smoke tests (7 tests)
    ├── 02-loan-creation.spec.ts # Loan creation tests (6 tests)
    ├── 03-loan-actions.spec.ts  # Loan action tests (16 tests)
    └── 04-edge-cases.spec.ts    # Edge cases and validation (10 tests)
```

**Total Test Coverage**: 39 E2E tests

## Test Categories

### 1. Smoke Tests (`01-smoke.spec.ts`)

Basic tests to ensure the application loads and displays correctly:

- Application loads successfully
- Initial empty state is displayed
- Loan form is visible
- Loan list section is visible
- Summary section displays zero values
- Empty message is shown when no loans exist
- Form field placeholders are correct

### 2. Loan Creation Tests (`02-loan-creation.spec.ts`)

Tests for creating loan applications:

- Create a loan application successfully
- Form resets after successful creation
- Create multiple loan applications
- Monthly payment calculation is correct
- Loans persist in localStorage
- Action buttons are displayed for pending loans

### 3. Loan Action Tests (`03-loan-actions.spec.ts`)

Tests for loan approval, rejection, auto-decision, and deletion:

**Approve Loan:**
- Approve a pending loan
- Update total approved amount when approving multiple loans

**Reject Loan:**
- Reject a pending loan
- Don't add to total approved amount when rejecting

**Auto-decide Loan:**
- Auto-approve when amount ≤ $100,000 AND term ≤ 60 months
- Auto-reject when amount > $100,000
- Auto-reject when term > 60 months

**Delete Loan:**
- Delete a pending loan
- Delete an approved loan
- Delete only the selected loan when multiple exist

### 4. Edge Cases and Validation Tests (`04-edge-cases.spec.ts`)

Tests for input validation, boundary conditions, and edge cases:

**Form Validation - Empty Values:**
- Cannot create loan with empty applicant name
- Cannot create loan with zero amount
- Cannot create loan with zero term

**Form Validation - Negative Values:**
- Cannot create loan with negative amount
- Cannot create loan with negative interest rate

**Boundary Values:**
- Create loan at auto-approve boundary ($100,000 and 60 months)
- Auto-reject loan just above amount boundary ($100,001)
- Auto-reject loan just above term boundary (61 months)

**Special Characters and Formatting:**
- Handle applicant names with special characters
- Handle very large loan amounts
- Handle very long term periods
- Handle zero interest rate

**LocalStorage Edge Cases:**
- Handle corrupted localStorage data gracefully
- Persist loans after page refresh

**Concurrent Operations:**
- Handle rapid form submissions
- Handle multiple status changes

## Page Object Model (POM)

The tests follow the **Page Object Model** design pattern for better maintainability:

### Design Principles

1. **Atomic Methods**: Small, single-purpose methods for individual actions
2. **Grouped Actions**: Higher-level methods that combine multiple actions
3. **Assertions in Page Objects**: All `expect()` calls are within page objects
4. **Custom Error Messages**: Every assertion has a descriptive message
5. **Locators Based on Accessibility**: Use `getByRole()` when possible
6. **Text Library**: All text constants are centralized in `text-library.ts`
7. **No Logic in Tests**: Business logic is in page objects and helpers

### Example Usage

```typescript
// Test file
test('should create a loan application', async () => {
  const loanData = TEST_DATA.VALID_LOAN_SMALL;
  
  // Grouped action
  await loanApp.form.createLoanApplication(
    loanData.name,
    loanData.amount,
    loanData.term,
    loanData.rate
  );
  
  // Assertions in page object
  await loanApp.list.expectTableVisible();
  await loanApp.list.expectLoanCount(1);
});
```

## Running Tests

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

### Run Tests in Debug Mode

```bash
npm run test:e2e:debug
```

### View HTML Report

After running tests, view the HTML report:

```bash
npm run playwright:report
```

## GitHub Actions Integration

### Manual Workflow Trigger

The Playwright tests can be triggered manually via GitHub Actions:

1. Go to the **Actions** tab in the GitHub repository
2. Select **Playwright Tests** workflow
3. Click **Run workflow**
4. Select the branch to run tests on
5. Click **Run workflow** button

### Automatic Triggers

The workflow also runs automatically on:
- Pull requests to `main` branch (optional, can be enabled/disabled)

### Workflow Artifacts

After each workflow run, you can download:
- **playwright-report**: HTML report with test results, screenshots, and videos
- **playwright-results**: JSON test data for programmatic analysis

Artifacts are retained for 30 days.

## Test Reports

### HTML Report

The HTML report (`playwright-report/index.html`) provides:
- Visual overview of test results
- Test suite breakdown
- Individual test status with duration
- Screenshots and videos for failed tests
- Interactive trace viewer for debugging
- Network activity and console logs

### JSON Results

The `playwright-results.json` file contains:
- Detailed test execution data
- Test suite structure
- Individual test results
- Timing information
- Error details

## Configuration

The Playwright configuration is in `playwright.config.ts`:

- **testDir**: `./e2e-tests` - Location of test files
- **fullyParallel**: `true` - Run tests in parallel
- **retries**: 2 on CI, 0 locally - Automatic retry on failure
- **reporter**: HTML, JSON, and list reporters
- **baseURL**: `http://localhost:5173` - Application URL
- **trace**: On failure - Capture detailed trace for debugging
- **screenshot**: On failure - Capture screenshots
- **video**: On failure - Record videos
- **webServer**: Automatically starts dev server before tests

## Best Practices

### Writing New Tests

1. **Use Page Objects**: Never interact with elements directly in test files
2. **Descriptive Names**: Test names should clearly describe what they test
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
4. **Use Text Library**: Import constants from `text-library.ts`
5. **Clean State**: Each test should start with a clean state (clear localStorage)
6. **Wait for State**: Use Playwright's auto-waiting features
7. **Custom Messages**: Add custom messages to all assertions

### Example Test Structure

```typescript
test('should do something specific', async () => {
  // Arrange: Set up test data
  const testData = TEST_DATA.VALID_LOAN_SMALL;
  
  // Act: Perform the action
  await loanApp.form.createLoanApplication(
    testData.name,
    testData.amount,
    testData.term,
    testData.rate
  );
  
  // Assert: Verify the result
  await loanApp.list.expectLoanCount(1);
  await loanApp.list.expectLoanData(0, {
    applicant: testData.name,
    status: TEXT.STATUS_PENDING
  });
});
```

## Debugging Tests

### View Test Trace

When a test fails, Playwright captures a trace. To view it:

```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

The trace viewer shows:
- Step-by-step test execution
- DOM snapshots at each step
- Network requests
- Console logs
- Screenshots

### Run Single Test

To run a specific test file:

```bash
npx playwright test e2e-tests/tests/01-smoke.spec.ts
```

### Debug Mode

Run tests in debug mode to step through them:

```bash
npm run test:e2e:debug
```

This opens the Playwright Inspector where you can:
- Step through tests line by line
- Inspect element locators
- View page state at each step
- Edit and retry selectors

## Troubleshooting

### Tests Failing Locally

1. Ensure dependencies are installed: `npm install`
2. Install Playwright browsers: `npx playwright install --with-deps chromium`
3. Clear test artifacts: `rm -rf test-results playwright-report`
4. Check if dev server is already running on port 5173

### Tests Failing in CI

1. Check GitHub Actions logs for error details
2. Download artifacts (screenshots, videos, traces) from workflow run
3. View the HTML report artifact for detailed results
4. Check if the issue is timing-related (consider increasing timeouts)

### Flaky Tests

If tests are flaky:
1. Check for race conditions (missing waits)
2. Ensure proper cleanup between tests
3. Review page object methods for reliable locators
4. Use Playwright's auto-waiting features instead of fixed delays

## Test Coverage Goals

Current E2E test coverage:
- **Core user journeys**: 100% (all main flows covered)
- **CRUD operations**: 100% (create, read, update, delete)
- **Form validation**: 100% (all validation rules tested)
- **Edge cases**: Extensive (boundary values, special characters, error handling)
- **LocalStorage**: Covered (persistence and error handling)

## Continuous Improvement

Areas for future enhancement:
1. Add visual regression testing
2. Add performance testing (load times, interactions)
3. Add accessibility testing (a11y checks)
4. Expand browser coverage (Firefox, Safari)
5. Add mobile viewport testing
6. Add API mocking for advanced scenarios

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Best Practices](https://playwright.dev/docs/pom)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [Test Reporters](https://playwright.dev/docs/test-reporters)
