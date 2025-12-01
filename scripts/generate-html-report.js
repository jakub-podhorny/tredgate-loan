/* eslint-env node */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read the JSON test results
const jsonPath = join(__dirname, '../test-results.json')
const outputPath = join(__dirname, '../test-report.html')

let results
try {
  const jsonContent = readFileSync(jsonPath, 'utf-8')
  results = JSON.parse(jsonContent)
} catch (error) {
  console.error('Error reading test results:', error.message)
  process.exit(1)
}

// Generate HTML report
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report - Tredgate Loan</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    
    .header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .header p {
      opacity: 0.9;
      font-size: 1rem;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }
    
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.2s;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .stat-label {
      color: #6c757d;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .stat-card.success .stat-value { color: #28a745; }
    .stat-card.danger .stat-value { color: #dc3545; }
    .stat-card.warning .stat-value { color: #ffc107; }
    .stat-card.info .stat-value { color: #17a2b8; }
    
    .content {
      padding: 2rem;
    }
    
    .test-suite {
      margin-bottom: 2rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .suite-header {
      background: #f8f9fa;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .suite-name {
      font-weight: 600;
      font-size: 1.1rem;
      color: #495057;
    }
    
    .suite-stats {
      font-size: 0.875rem;
      color: #6c757d;
    }
    
    .test-list {
      list-style: none;
    }
    
    .test-item {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background-color 0.2s;
    }
    
    .test-item:last-child {
      border-bottom: none;
    }
    
    .test-item:hover {
      background: #f8f9fa;
    }
    
    .test-name {
      flex: 1;
    }
    
    .test-status {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .test-status.passed {
      background: #d4edda;
      color: #155724;
    }
    
    .test-status.failed {
      background: #f8d7da;
      color: #721c24;
    }
    
    .test-status.skipped {
      background: #fff3cd;
      color: #856404;
    }
    
    .test-duration {
      margin-left: 1rem;
      color: #6c757d;
      font-size: 0.875rem;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 1.5rem;
      text-align: center;
      color: #6c757d;
      font-size: 0.875rem;
      border-top: 1px solid #e9ecef;
    }
    
    .status-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .pass-icon { color: #28a745; }
    .fail-icon { color: #dc3545; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="status-icon">${results.success ? '✅' : '❌'}</div>
      <h1>Test Report</h1>
      <p>Tredgate Loan Application Tests</p>
      <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
      <div class="stat-card info">
        <div class="stat-value">${results.numTotalTestSuites || 0}</div>
        <div class="stat-label">Test Suites</div>
      </div>
      <div class="stat-card info">
        <div class="stat-value">${results.numTotalTests || 0}</div>
        <div class="stat-label">Total Tests</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">${results.numPassedTests || 0}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-value">${results.numFailedTests || 0}</div>
        <div class="stat-label">Failed</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">${results.numPendingTests || 0}</div>
        <div class="stat-label">Skipped</div>
      </div>
      <div class="stat-card info">
        <div class="stat-value">${calculateTotalDuration(results.testResults || [])}</div>
        <div class="stat-label">Duration</div>
      </div>
    </div>
    
    <div class="content">
      ${generateTestSuites(results.testResults || [])}
    </div>
    
    <div class="footer">
      <p>Test run completed ${results.success ? 'successfully' : 'with failures'}</p>
      <p>Generated by Vitest HTML Reporter</p>
    </div>
  </div>
</body>
</html>`

writeFileSync(outputPath, html, 'utf-8')
console.log(`✅ HTML report generated: ${outputPath}`)

function calculateTotalDuration(testResults) {
  if (!testResults || testResults.length === 0) {
    return '0ms'
  }
  
  const totalMs = testResults.reduce((sum, suite) => {
    const duration = (suite.endTime || 0) - (suite.startTime || 0)
    return sum + duration
  }, 0)
  
  return `${totalMs.toFixed(0)}ms`
}

function generateTestSuites(testResults) {
  if (!testResults || testResults.length === 0) {
    return '<p style="text-align: center; color: #6c757d;">No test results found.</p>'
  }
  
  return testResults.map(suite => {
    const tests = suite.assertionResults || []
    const passed = tests.filter(t => t.status === 'passed').length
    const failed = tests.filter(t => t.status === 'failed').length
    const skipped = tests.filter(t => t.status === 'pending' || t.status === 'skipped').length
    
    return `
      <div class="test-suite">
        <div class="suite-header">
          <div class="suite-name">${suite.name || 'Unknown Suite'}</div>
          <div class="suite-stats">
            <span style="color: #28a745;">✓ ${passed}</span>
            ${failed > 0 ? `<span style="color: #dc3545; margin-left: 1rem;">✗ ${failed}</span>` : ''}
            ${skipped > 0 ? `<span style="color: #ffc107; margin-left: 1rem;">⊘ ${skipped}</span>` : ''}
          </div>
        </div>
        <ul class="test-list">
          ${tests.map(test => `
            <li class="test-item">
              <div class="test-name">${test.title || test.fullName || 'Unknown Test'}</div>
              <div>
                <span class="test-status ${test.status}">${test.status}</span>
                ${test.duration ? `<span class="test-duration">${test.duration}ms</span>` : ''}
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `
  }).join('')
}
