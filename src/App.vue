<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { LoanApplication } from './types/loan'
import { getLoans, updateLoanStatus, autoDecideLoan, deleteLoan } from './services/loanService'
import LoanForm from './components/LoanForm.vue'
import LoanList from './components/LoanList.vue'
import LoanSummary from './components/LoanSummary.vue'
import AuditLogViewer from './components/AuditLogViewer.vue'

const loans = ref<LoanApplication[]>([])
const currentView = ref<'loans' | 'audit'>('loans')

function refreshLoans() {
  loans.value = getLoans()
}

function showLoansView() {
  currentView.value = 'loans'
}

function showAuditView() {
  currentView.value = 'audit'
}

function handleApprove(id: string) {
  updateLoanStatus(id, 'approved')
  refreshLoans()
}

function handleReject(id: string) {
  updateLoanStatus(id, 'rejected')
  refreshLoans()
}

function handleAutoDecide(id: string) {
  autoDecideLoan(id)
  refreshLoans()
}

function handleDelete(id: string) {
  deleteLoan(id)
  refreshLoans()
}

onMounted(() => {
  refreshLoans()
})
</script>

<template>
  <div class="app">
    <header class="app-header">
      <img src="/tredgate-logo-original.png" alt="Tredgate Logo" class="logo" />
      <h1>Tredgate Loan</h1>
      <p class="tagline">Simple loan application management</p>
    </header>

    <nav class="navigation">
      <button 
        @click="showLoansView" 
        :class="{ active: currentView === 'loans' }"
        class="nav-btn"
      >
        Loan Applications
      </button>
      <button 
        @click="showAuditView" 
        :class="{ active: currentView === 'audit' }"
        class="nav-btn"
      >
        Audit Log
      </button>
    </nav>

    <LoanSummary v-if="currentView === 'loans'" :loans="loans" />

    <main v-if="currentView === 'loans'" class="main-content">
      <div class="left-column">
        <LoanForm @created="refreshLoans" />
      </div>
      <div class="right-column">
        <LoanList
          :loans="loans"
          @approve="handleApprove"
          @reject="handleReject"
          @auto-decide="handleAutoDecide"
          @delete="handleDelete"
        />
      </div>
    </main>

    <main v-if="currentView === 'audit'" class="audit-content">
      <AuditLogViewer />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1rem 0;
}

.logo {
  width: 80px;
  height: auto;
  margin-bottom: 0.5rem;
}

.tagline {
  color: var(--tagline-color);
  margin-top: 0.25rem;
  font-size: 1rem;
}

.navigation {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--primary-color);
  background: white;
  color: var(--primary-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #f5f5f5;
}

.nav-btn.active {
  background: var(--primary-color);
  color: white;
}

.main-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.audit-content {
  max-width: 1400px;
  margin: 0 auto;
}

.left-column {
  flex: 0 0 400px;
}

.right-column {
  flex: 1;
  min-width: 0;
}

@media (max-width: 900px) {
  .main-content {
    flex-direction: column;
  }

  .left-column,
  .right-column {
    flex: 1;
    width: 100%;
    max-width: 100%;
  }
}
</style>
