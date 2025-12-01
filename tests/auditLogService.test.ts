import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAuditLogs,
  saveAuditLogs,
  createLoanCreatedLog,
  createStatusChangeLog,
  createLoanDeletedLog,
  addAuditLog,
  filterLogsByActionType,
  searchLogs,
  sortLogsByTimestamp,
  processAuditLogs
} from '../src/services/auditLogService'
import type { AuditLogEntry } from '../src/types/auditLog'

// Mock localStorage
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
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('auditLogService', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('getAuditLogs', () => {
    it('returns empty array when nothing is stored', () => {
      const logs = getAuditLogs()
      expect(logs).toEqual([])
    })

    it('returns stored audit logs', () => {
      const storedLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          actionType: 'loan_created',
          loanId: 'loan-1',
          applicantName: 'John Doe',
          loanAmount: 50000
        }
      ]
      localStorageMock.setItem('tredgate_audit_logs', JSON.stringify(storedLogs))

      const logs = getAuditLogs()
      expect(logs).toEqual(storedLogs)
    })

    it('returns empty array when stored data is invalid', () => {
      localStorageMock.setItem('tredgate_audit_logs', 'invalid-json')
      const logs = getAuditLogs()
      expect(logs).toEqual([])
    })
  })

  describe('saveAuditLogs', () => {
    it('saves audit logs to localStorage', () => {
      const logs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          actionType: 'loan_created',
          loanId: 'loan-1',
          applicantName: 'Jane Doe',
          loanAmount: 75000
        }
      ]

      saveAuditLogs(logs)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'tredgate_audit_logs',
        JSON.stringify(logs)
      )
    })
  })

  describe('createLoanCreatedLog', () => {
    it('creates a loan created log entry', () => {
      const input = {
        loanId: 'loan-1',
        applicantName: 'Alice Smith',
        loanAmount: 25000
      }

      const log = createLoanCreatedLog(input)

      expect(log.actionType).toBe('loan_created')
      expect(log.loanId).toBe('loan-1')
      expect(log.applicantName).toBe('Alice Smith')
      expect(log.loanAmount).toBe(25000)
      expect(log.id).toBeDefined()
      expect(log.timestamp).toBeDefined()
      expect(log.previousStatus).toBeUndefined()
      expect(log.newStatus).toBeUndefined()
      expect(log.decisionMethod).toBeUndefined()
    })
  })

  describe('createStatusChangeLog', () => {
    it('creates a manual status change log entry', () => {
      const input = {
        loanId: 'loan-2',
        applicantName: 'Bob Jones',
        loanAmount: 50000,
        previousStatus: 'pending',
        newStatus: 'approved',
        isAuto: false
      }

      const log = createStatusChangeLog(input)

      expect(log.actionType).toBe('status_changed_manual')
      expect(log.loanId).toBe('loan-2')
      expect(log.applicantName).toBe('Bob Jones')
      expect(log.loanAmount).toBe(50000)
      expect(log.previousStatus).toBe('pending')
      expect(log.newStatus).toBe('approved')
      expect(log.decisionMethod).toBe('manual')
      expect(log.id).toBeDefined()
      expect(log.timestamp).toBeDefined()
    })

    it('creates an auto status change log entry', () => {
      const input = {
        loanId: 'loan-3',
        applicantName: 'Charlie Brown',
        loanAmount: 150000,
        previousStatus: 'pending',
        newStatus: 'rejected',
        isAuto: true
      }

      const log = createStatusChangeLog(input)

      expect(log.actionType).toBe('status_changed_auto')
      expect(log.loanId).toBe('loan-3')
      expect(log.applicantName).toBe('Charlie Brown')
      expect(log.loanAmount).toBe(150000)
      expect(log.previousStatus).toBe('pending')
      expect(log.newStatus).toBe('rejected')
      expect(log.decisionMethod).toBe('auto')
      expect(log.id).toBeDefined()
      expect(log.timestamp).toBeDefined()
    })
  })

  describe('createLoanDeletedLog', () => {
    it('creates a loan deleted log entry', () => {
      const input = {
        loanId: 'loan-4',
        applicantName: 'David Wilson',
        loanAmount: 30000,
        status: 'rejected'
      }

      const log = createLoanDeletedLog(input)

      expect(log.actionType).toBe('loan_deleted')
      expect(log.loanId).toBe('loan-4')
      expect(log.applicantName).toBe('David Wilson')
      expect(log.loanAmount).toBe(30000)
      expect(log.previousStatus).toBe('rejected')
      expect(log.id).toBeDefined()
      expect(log.timestamp).toBeDefined()
      expect(log.newStatus).toBeUndefined()
      expect(log.decisionMethod).toBeUndefined()
    })
  })

  describe('addAuditLog', () => {
    it('adds a log entry to empty logs', () => {
      const entry: AuditLogEntry = {
        id: '1',
        timestamp: '2024-01-01T00:00:00.000Z',
        actionType: 'loan_created',
        loanId: 'loan-1',
        applicantName: 'Test User',
        loanAmount: 10000
      }

      addAuditLog(entry)

      const logs = getAuditLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0]).toEqual(entry)
    })

    it('appends a log entry to existing logs', () => {
      const existingLog: AuditLogEntry = {
        id: '1',
        timestamp: '2024-01-01T00:00:00.000Z',
        actionType: 'loan_created',
        loanId: 'loan-1',
        applicantName: 'First User',
        loanAmount: 10000
      }
      saveAuditLogs([existingLog])

      const newEntry: AuditLogEntry = {
        id: '2',
        timestamp: '2024-01-02T00:00:00.000Z',
        actionType: 'loan_deleted',
        loanId: 'loan-1',
        applicantName: 'First User',
        loanAmount: 10000,
        previousStatus: 'approved'
      }

      addAuditLog(newEntry)

      const logs = getAuditLogs()
      expect(logs).toHaveLength(2)
      expect(logs[1]).toEqual(newEntry)
    })
  })

  describe('filterLogsByActionType', () => {
    const sampleLogs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T00:00:00.000Z',
        actionType: 'loan_created',
        loanId: 'loan-1',
        applicantName: 'User 1',
        loanAmount: 10000
      },
      {
        id: '2',
        timestamp: '2024-01-02T00:00:00.000Z',
        actionType: 'status_changed_manual',
        loanId: 'loan-1',
        applicantName: 'User 1',
        loanAmount: 10000,
        previousStatus: 'pending',
        newStatus: 'approved',
        decisionMethod: 'manual'
      },
      {
        id: '3',
        timestamp: '2024-01-03T00:00:00.000Z',
        actionType: 'loan_deleted',
        loanId: 'loan-1',
        applicantName: 'User 1',
        loanAmount: 10000,
        previousStatus: 'approved'
      }
    ]

    it('returns all logs when actionType is "all"', () => {
      const filtered = filterLogsByActionType(sampleLogs, 'all')
      expect(filtered).toEqual(sampleLogs)
    })

    it('returns all logs when actionType is empty', () => {
      const filtered = filterLogsByActionType(sampleLogs, '')
      expect(filtered).toEqual(sampleLogs)
    })

    it('filters logs by loan_created action type', () => {
      const filtered = filterLogsByActionType(sampleLogs, 'loan_created')
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.actionType).toBe('loan_created')
    })

    it('filters logs by status_changed_manual action type', () => {
      const filtered = filterLogsByActionType(sampleLogs, 'status_changed_manual')
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.actionType).toBe('status_changed_manual')
    })

    it('filters logs by loan_deleted action type', () => {
      const filtered = filterLogsByActionType(sampleLogs, 'loan_deleted')
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.actionType).toBe('loan_deleted')
    })

    it('returns empty array when no logs match', () => {
      const filtered = filterLogsByActionType(sampleLogs, 'status_changed_auto')
      expect(filtered).toHaveLength(0)
    })
  })

  describe('searchLogs', () => {
    const sampleLogs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T00:00:00.000Z',
        actionType: 'loan_created',
        loanId: 'loan-abc',
        applicantName: 'Alice Smith',
        loanAmount: 10000
      },
      {
        id: '2',
        timestamp: '2024-01-02T00:00:00.000Z',
        actionType: 'loan_created',
        loanId: 'loan-xyz',
        applicantName: 'Bob Jones',
        loanAmount: 20000
      },
      {
        id: '3',
        timestamp: '2024-01-03T00:00:00.000Z',
        actionType: 'loan_created',
        loanId: 'loan-def',
        applicantName: 'Alice Johnson',
        loanAmount: 30000
      }
    ]

    it('returns all logs when search term is empty', () => {
      const searched = searchLogs(sampleLogs, '')
      expect(searched).toEqual(sampleLogs)
    })

    it('searches by applicant name (case-insensitive)', () => {
      const searched = searchLogs(sampleLogs, 'alice')
      expect(searched).toHaveLength(2)
      expect(searched.every(log => log.applicantName.toLowerCase().includes('alice'))).toBe(true)
    })

    it('searches by loan ID (case-insensitive)', () => {
      const searched = searchLogs(sampleLogs, 'abc')
      expect(searched).toHaveLength(1)
      expect(searched[0]?.loanId).toBe('loan-abc')
    })

    it('searches by partial match', () => {
      const searched = searchLogs(sampleLogs, 'jones')
      expect(searched).toHaveLength(1)
      expect(searched[0]?.applicantName).toBe('Bob Jones')
    })

    it('returns empty array when no matches found', () => {
      const searched = searchLogs(sampleLogs, 'nonexistent')
      expect(searched).toHaveLength(0)
    })

    it('trims whitespace from search term', () => {
      const searched = searchLogs(sampleLogs, '  bob  ')
      expect(searched).toHaveLength(1)
      expect(searched[0]?.applicantName).toBe('Bob Jones')
    })
  })

  describe('sortLogsByTimestamp', () => {
    it('sorts logs in reverse chronological order', () => {
      const unsortedLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          actionType: 'loan_created',
          loanId: 'loan-1',
          applicantName: 'User 1',
          loanAmount: 10000
        },
        {
          id: '2',
          timestamp: '2024-01-03T00:00:00.000Z',
          actionType: 'loan_created',
          loanId: 'loan-2',
          applicantName: 'User 2',
          loanAmount: 20000
        },
        {
          id: '3',
          timestamp: '2024-01-02T00:00:00.000Z',
          actionType: 'loan_created',
          loanId: 'loan-3',
          applicantName: 'User 3',
          loanAmount: 30000
        }
      ]

      const sorted = sortLogsByTimestamp(unsortedLogs)
      
      expect(sorted).toHaveLength(3)
      expect(sorted[0]?.id).toBe('2') // newest
      expect(sorted[1]?.id).toBe('3')
      expect(sorted[2]?.id).toBe('1') // oldest
    })

    it('does not mutate the original array', () => {
      const originalLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          actionType: 'loan_created',
          loanId: 'loan-1',
          applicantName: 'User 1',
          loanAmount: 10000
        },
        {
          id: '2',
          timestamp: '2024-01-02T00:00:00.000Z',
          actionType: 'loan_created',
          loanId: 'loan-2',
          applicantName: 'User 2',
          loanAmount: 20000
        }
      ]

      sortLogsByTimestamp(originalLogs)

      expect(originalLogs[0]?.id).toBe('1')
      expect(originalLogs[1]?.id).toBe('2')
    })
  })

  describe('processAuditLogs', () => {
    const sampleLogs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T00:00:00.000Z',
        actionType: 'loan_created',
        loanId: 'loan-1',
        applicantName: 'Alice Smith',
        loanAmount: 10000
      },
      {
        id: '2',
        timestamp: '2024-01-03T00:00:00.000Z',
        actionType: 'status_changed_manual',
        loanId: 'loan-1',
        applicantName: 'Alice Smith',
        loanAmount: 10000,
        previousStatus: 'pending',
        newStatus: 'approved',
        decisionMethod: 'manual'
      },
      {
        id: '3',
        timestamp: '2024-01-02T00:00:00.000Z',
        actionType: 'loan_created',
        loanId: 'loan-2',
        applicantName: 'Bob Jones',
        loanAmount: 20000
      }
    ]

    it('applies filter, search, and sort', () => {
      const processed = processAuditLogs(sampleLogs, 'loan_created', 'alice')
      
      expect(processed).toHaveLength(1)
      expect(processed[0]?.actionType).toBe('loan_created')
      expect(processed[0]?.applicantName).toBe('Alice Smith')
    })

    it('returns all logs sorted when no filter or search', () => {
      const processed = processAuditLogs(sampleLogs, 'all', '')
      
      expect(processed).toHaveLength(3)
      expect(processed[0]?.id).toBe('2') // newest
      expect(processed[1]?.id).toBe('3')
      expect(processed[2]?.id).toBe('1') // oldest
    })

    it('applies only filter when no search term', () => {
      const processed = processAuditLogs(sampleLogs, 'loan_created', '')
      
      expect(processed).toHaveLength(2)
      expect(processed[0]?.id).toBe('3') // newest loan_created
      expect(processed[1]?.id).toBe('1') // oldest loan_created
    })

    it('applies only search when filter is "all"', () => {
      const processed = processAuditLogs(sampleLogs, 'all', 'bob')
      
      expect(processed).toHaveLength(1)
      expect(processed[0]?.applicantName).toBe('Bob Jones')
    })
  })
})
