import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanSummary from '../src/components/LoanSummary.vue'
import type { LoanApplication } from '../src/types/loan'

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

describe('LoanSummary', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  const mockLoans: LoanApplication[] = [
    {
      id: '1',
      applicantName: 'John Doe',
      amount: 50000,
      termMonths: 24,
      interestRate: 0.08,
      status: 'pending',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      applicantName: 'Jane Smith',
      amount: 75000,
      termMonths: 36,
      interestRate: 0.06,
      status: 'approved',
      createdAt: '2024-02-01T00:00:00.000Z'
    },
    {
      id: '3',
      applicantName: 'Bob Johnson',
      amount: 100000,
      termMonths: 48,
      interestRate: 0.07,
      status: 'approved',
      createdAt: '2024-03-01T00:00:00.000Z'
    },
    {
      id: '4',
      applicantName: 'Alice Brown',
      amount: 30000,
      termMonths: 12,
      interestRate: 0.05,
      status: 'rejected',
      createdAt: '2024-04-01T00:00:00.000Z'
    }
  ]

  it('renders all stat cards', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards).toHaveLength(5)
  })

  it('displays correct total applications count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    const totalCard = statCards[0]
    expect(totalCard?.find('.stat-value').text()).toBe('4')
    expect(totalCard?.find('.stat-label').text()).toBe('Total Applications')
  })

  it('displays correct pending count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    const pendingCard = statCards[1]
    expect(pendingCard?.find('.stat-value').text()).toBe('1')
    expect(pendingCard?.find('.stat-label').text()).toBe('Pending')
  })

  it('displays correct approved count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    const approvedCard = statCards[2]
    expect(approvedCard?.find('.stat-value').text()).toBe('2')
    expect(approvedCard?.find('.stat-label').text()).toBe('Approved')
  })

  it('displays correct rejected count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    const rejectedCard = statCards[3]
    expect(rejectedCard?.find('.stat-value').text()).toBe('1')
    expect(rejectedCard?.find('.stat-label').text()).toBe('Rejected')
  })

  it('calculates total approved amount correctly', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    const amountCard = statCards[4]
    // 75000 + 100000 = 175000
    expect(amountCard?.find('.stat-value').text()).toBe('$175,000')
    expect(amountCard?.find('.stat-label').text()).toBe('Total Approved')
  })

  it('displays zero values when no loans exist', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: [] }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('0')
    expect(statCards[1]?.find('.stat-value').text()).toBe('0')
    expect(statCards[2]?.find('.stat-value').text()).toBe('0')
    expect(statCards[3]?.find('.stat-value').text()).toBe('0')
    expect(statCards[4]?.find('.stat-value').text()).toBe('$0')
  })

  it('applies correct CSS classes to stat cards', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[1]?.classes()).toContain('pending')
    expect(statCards[2]?.classes()).toContain('approved')
    expect(statCards[3]?.classes()).toContain('rejected')
    expect(statCards[4]?.classes()).toContain('amount')
  })

  it('formats currency without decimals', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    const amountText = statCards[4]?.find('.stat-value').text()
    expect(amountText).not.toContain('.00')
    expect(amountText).toBe('$175,000')
  })

  it('handles loans with only pending status', () => {
    const pendingLoans: LoanApplication[] = [
      {
        id: '1',
        applicantName: 'Test User',
        amount: 10000,
        termMonths: 12,
        interestRate: 0.05,
        status: 'pending',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ]
    
    const wrapper = mount(LoanSummary, {
      props: { loans: pendingLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('1') // total
    expect(statCards[1]?.find('.stat-value').text()).toBe('1') // pending
    expect(statCards[2]?.find('.stat-value').text()).toBe('0') // approved
    expect(statCards[3]?.find('.stat-value').text()).toBe('0') // rejected
    expect(statCards[4]?.find('.stat-value').text()).toBe('$0') // total approved amount
  })

  it('handles loans with only approved status', () => {
    const approvedLoans: LoanApplication[] = [
      {
        id: '1',
        applicantName: 'Test User',
        amount: 25000,
        termMonths: 24,
        interestRate: 0.06,
        status: 'approved',
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        applicantName: 'Another User',
        amount: 35000,
        termMonths: 36,
        interestRate: 0.07,
        status: 'approved',
        createdAt: '2024-02-01T00:00:00.000Z'
      }
    ]
    
    const wrapper = mount(LoanSummary, {
      props: { loans: approvedLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('2') // total
    expect(statCards[1]?.find('.stat-value').text()).toBe('0') // pending
    expect(statCards[2]?.find('.stat-value').text()).toBe('2') // approved
    expect(statCards[3]?.find('.stat-value').text()).toBe('0') // rejected
    expect(statCards[4]?.find('.stat-value').text()).toBe('$60,000') // total approved amount
  })

  it('handles loans with only rejected status', () => {
    const rejectedLoans: LoanApplication[] = [
      {
        id: '1',
        applicantName: 'Test User',
        amount: 200000,
        termMonths: 120,
        interestRate: 0.10,
        status: 'rejected',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ]
    
    const wrapper = mount(LoanSummary, {
      props: { loans: rejectedLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('1') // total
    expect(statCards[1]?.find('.stat-value').text()).toBe('0') // pending
    expect(statCards[2]?.find('.stat-value').text()).toBe('0') // approved
    expect(statCards[3]?.find('.stat-value').text()).toBe('1') // rejected
    expect(statCards[4]?.find('.stat-value').text()).toBe('$0') // total approved amount
  })
})
