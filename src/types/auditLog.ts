/**
 * Union type for audit log action types
 */
export type AuditActionType = 'loan_created' | 'status_changed_manual' | 'status_changed_auto' | 'loan_deleted'

/**
 * Represents an audit log entry for loan application events
 */
export interface AuditLogEntry {
  id: string
  timestamp: string           // ISO timestamp
  actionType: AuditActionType
  loanId: string
  applicantName: string
  previousStatus?: string     // for status changes
  newStatus?: string          // for status changes
  loanAmount: number
  decisionMethod?: string     // 'manual' or 'auto' for status changes
}

/**
 * Input for creating a loan creation log entry
 */
export interface CreateLoanLogInput {
  loanId: string
  applicantName: string
  loanAmount: number
}

/**
 * Input for creating a status change log entry
 */
export interface StatusChangeLogInput {
  loanId: string
  applicantName: string
  loanAmount: number
  previousStatus: string
  newStatus: string
  isAuto: boolean
}

/**
 * Input for creating a loan deletion log entry
 */
export interface DeleteLoanLogInput {
  loanId: string
  applicantName: string
  loanAmount: number
  status: string
}
