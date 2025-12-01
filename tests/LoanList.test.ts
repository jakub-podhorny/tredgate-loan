import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanList from '../src/components/LoanList.vue'
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

describe('LoanList', () => {
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
      amount: 150000,
      termMonths: 72,
      interestRate: 0.09,
      status: 'rejected',
      createdAt: '2024-03-01T00:00:00.000Z'
    }
  ]

  it('renders the component with title', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [] }
    })
    
    expect(wrapper.find('h2').text()).toBe('Loan Applications')
  })

  it('displays empty state when no loans exist', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [] }
    })
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-state p').text()).toContain('No loan applications yet')
  })

  it('displays table when loans exist', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    expect(wrapper.find('.empty-state').exists()).toBe(false)
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('tbody tr')).toBeTruthy()
  })

  it('displays correct number of loan rows', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(3)
  })

  it('displays loan details correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    const firstRow = wrapper.find('tbody tr')
    expect(firstRow.text()).toContain('John Doe')
    expect(firstRow.text()).toContain('$50,000.00')
    expect(firstRow.text()).toContain('24 mo')
    expect(firstRow.text()).toContain('8.0%')
    expect(firstRow.text()).toContain('pending')
  })

  it('formats currency correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    expect(wrapper.text()).toContain('$50,000.00')
  })

  it('formats percentage correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    expect(wrapper.text()).toContain('8.0%')
  })

  it('calculates and displays monthly payment correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    // amount: 50000, interestRate: 0.08, termMonths: 24
    // Formula: total = amount * (1 + interestRate), monthly = total / termMonths
    // total = 50000 * 1.08 = 54000
    // monthly = 54000 / 24 = 2250
    expect(wrapper.text()).toContain('$2,250.00')
  })

  it('displays status badge with correct class', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    const badges = wrapper.findAll('.status-badge')
    expect(badges[0]?.classes()).toContain('status-pending')
    expect(badges[1]?.classes()).toContain('status-approved')
    expect(badges[2]?.classes()).toContain('status-rejected')
  })

  it('shows action buttons for pending loans', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    expect(wrapper.findAll('.action-btn')).toHaveLength(3)
    expect(wrapper.find('.action-btn.success').exists()).toBe(true)
    expect(wrapper.find('.action-btn.danger').exists()).toBe(true)
    expect(wrapper.find('.action-btn.secondary').exists()).toBe(true)
  })

  it('hides action buttons for non-pending loans', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[1]!] }
    })
    
    expect(wrapper.find('.action-btn').exists()).toBe(false)
    expect(wrapper.find('.no-actions').exists()).toBe(true)
  })

  it('emits approve event when approve button clicked', async () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    await wrapper.find('.action-btn.success').trigger('click')
    
    expect(wrapper.emitted('approve')).toBeTruthy()
    expect(wrapper.emitted('approve')?.[0]).toEqual(['1'])
  })

  it('emits reject event when reject button clicked', async () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    await wrapper.find('.action-btn.danger').trigger('click')
    
    expect(wrapper.emitted('reject')).toBeTruthy()
    expect(wrapper.emitted('reject')?.[0]).toEqual(['1'])
  })

  it('emits autoDecide event when auto-decide button clicked', async () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    await wrapper.find('.action-btn.secondary').trigger('click')
    
    expect(wrapper.emitted('autoDecide')).toBeTruthy()
    expect(wrapper.emitted('autoDecide')?.[0]).toEqual(['1'])
  })

  it('formats date in readable format', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    // Date should be formatted like "Jan 1, 2024"
    expect(wrapper.text()).toContain('Jan')
    expect(wrapper.text()).toContain('2024')
  })

  it('displays all table headers', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    const headers = wrapper.findAll('th')
    expect(headers[0]?.text()).toBe('Applicant')
    expect(headers[1]?.text()).toBe('Amount')
    expect(headers[2]?.text()).toBe('Term')
    expect(headers[3]?.text()).toBe('Rate')
    expect(headers[4]?.text()).toBe('Monthly Payment')
    expect(headers[5]?.text()).toBe('Status')
    expect(headers[6]?.text()).toBe('Created')
    expect(headers[7]?.text()).toBe('Actions')
  })
})
