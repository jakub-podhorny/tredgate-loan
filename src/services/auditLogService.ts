import type {
  AuditLogEntry,
  CreateLoanLogInput,
  StatusChangeLogInput,
  DeleteLoanLogInput
} from '../types/auditLog'

const STORAGE_KEY = 'tredgate_audit_logs'

/**
 * Generate a simple unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

/**
 * Load audit logs from localStorage
 * Returns empty array if nothing is stored
 */
export function getAuditLogs(): AuditLogEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }
    return JSON.parse(stored) as AuditLogEntry[]
  } catch {
    return []
  }
}

/**
 * Save audit logs to localStorage
 */
export function saveAuditLogs(logs: AuditLogEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
}

/**
 * Create an audit log entry for loan creation
 */
export function createLoanCreatedLog(input: CreateLoanLogInput): AuditLogEntry {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    actionType: 'loan_created',
    loanId: input.loanId,
    applicantName: input.applicantName,
    loanAmount: input.loanAmount
  }
}

/**
 * Create an audit log entry for status change
 */
export function createStatusChangeLog(input: StatusChangeLogInput): AuditLogEntry {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    actionType: input.isAuto ? 'status_changed_auto' : 'status_changed_manual',
    loanId: input.loanId,
    applicantName: input.applicantName,
    loanAmount: input.loanAmount,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    decisionMethod: input.isAuto ? 'auto' : 'manual'
  }
}

/**
 * Create an audit log entry for loan deletion
 */
export function createLoanDeletedLog(input: DeleteLoanLogInput): AuditLogEntry {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    actionType: 'loan_deleted',
    loanId: input.loanId,
    applicantName: input.applicantName,
    loanAmount: input.loanAmount,
    previousStatus: input.status
  }
}

/**
 * Add a log entry to the audit logs
 */
export function addAuditLog(entry: AuditLogEntry): void {
  const logs = getAuditLogs()
  logs.push(entry)
  saveAuditLogs(logs)
}

/**
 * Filter audit logs by action type
 */
export function filterLogsByActionType(logs: AuditLogEntry[], actionType: string): AuditLogEntry[] {
  if (!actionType || actionType === 'all') {
    return logs
  }
  return logs.filter(log => log.actionType === actionType)
}

/**
 * Search audit logs by applicant name or loan ID
 */
export function searchLogs(logs: AuditLogEntry[], searchTerm: string): AuditLogEntry[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return logs
  }
  
  const term = searchTerm.toLowerCase().trim()
  return logs.filter(log => 
    log.applicantName.toLowerCase().includes(term) ||
    log.loanId.toLowerCase().includes(term)
  )
}

/**
 * Sort logs in reverse chronological order (newest first)
 */
export function sortLogsByTimestamp(logs: AuditLogEntry[]): AuditLogEntry[] {
  return [...logs].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })
}

/**
 * Apply filters, search, and sort to audit logs
 */
export function processAuditLogs(
  logs: AuditLogEntry[],
  actionType: string,
  searchTerm: string
): AuditLogEntry[] {
  let processed = logs
  processed = filterLogsByActionType(processed, actionType)
  processed = searchLogs(processed, searchTerm)
  processed = sortLogsByTimestamp(processed)
  return processed
}
