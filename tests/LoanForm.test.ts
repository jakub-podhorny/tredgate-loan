import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanForm from '../src/components/LoanForm.vue'
import * as loanService from '../src/services/loanService'

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

describe('LoanForm', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders the form with all input fields', () => {
    const wrapper = mount(LoanForm)
    
    expect(wrapper.find('h2').text()).toBe('New Loan Application')
    expect(wrapper.find('#applicantName').exists()).toBe(true)
    expect(wrapper.find('#amount').exists()).toBe(true)
    expect(wrapper.find('#termMonths').exists()).toBe(true)
    expect(wrapper.find('#interestRate').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('displays error when applicant name is empty', async () => {
    const wrapper = mount(LoanForm)
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.find('.error-message').text()).toBe('Applicant name is required')
  })

  it('displays error when amount is invalid', async () => {
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue(0)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(0.05)
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.find('.error-message').text()).toBe('Amount must be greater than 0')
  })

  it('displays error when term months is invalid', async () => {
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(0)
    await wrapper.find('#interestRate').setValue(0.05)
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.find('.error-message').text()).toBe('Term months must be greater than 0')
  })

  it('displays error when interest rate is negative', async () => {
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(-0.05)
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.find('.error-message').text()).toBe('Interest rate is required and cannot be negative')
  })

  it('creates loan application with valid data', async () => {
    const wrapper = mount(LoanForm)
    const createSpy = vi.spyOn(loanService, 'createLoanApplication')
    
    await wrapper.find('#applicantName').setValue('Alice Smith')
    await wrapper.find('#amount').setValue(25000)
    await wrapper.find('#termMonths').setValue(24)
    await wrapper.find('#interestRate').setValue(0.08)
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(createSpy).toHaveBeenCalledWith({
      applicantName: 'Alice Smith',
      amount: 25000,
      termMonths: 24,
      interestRate: 0.08
    })
  })

  it('emits created event after successful submission', async () => {
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('Bob Johnson')
    await wrapper.find('#amount').setValue(15000)
    await wrapper.find('#termMonths').setValue(36)
    await wrapper.find('#interestRate').setValue(0.06)
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.emitted('created')).toBeTruthy()
    expect(wrapper.emitted('created')).toHaveLength(1)
  })

  it('resets form fields after successful submission', async () => {
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('Charlie Brown')
    await wrapper.find('#amount').setValue(20000)
    await wrapper.find('#termMonths').setValue(48)
    await wrapper.find('#interestRate').setValue(0.07)
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect((wrapper.find('#applicantName').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#amount').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#termMonths').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#interestRate').element as HTMLInputElement).value).toBe('')
  })

  it('trims whitespace from applicant name', async () => {
    const wrapper = mount(LoanForm)
    const createSpy = vi.spyOn(loanService, 'createLoanApplication')
    
    await wrapper.find('#applicantName').setValue('  John Doe  ')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(0.05)
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(createSpy).toHaveBeenCalledWith({
      applicantName: 'John Doe',
      amount: 10000,
      termMonths: 12,
      interestRate: 0.05
    })
  })

  it('displays error message when service throws error', async () => {
    const wrapper = mount(LoanForm)
    vi.spyOn(loanService, 'createLoanApplication').mockImplementation(() => {
      throw new Error('Service error')
    })
    
    await wrapper.find('#applicantName').setValue('Test User')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(0.05)
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.find('.error-message').text()).toBe('Service error')
  })
})
