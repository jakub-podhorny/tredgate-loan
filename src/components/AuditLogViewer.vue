<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAuditLogs, processAuditLogs } from '../services/auditLogService'
import type { AuditLogEntry } from '../types/auditLog'

const allLogs = ref<AuditLogEntry[]>([])
const filterType = ref<string>('all')
const searchTerm = ref<string>('')

const processedLogs = computed(() => {
  return processAuditLogs(allLogs.value, filterType.value, searchTerm.value)
})

function loadLogs() {
  allLogs.value = getAuditLogs()
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function getActionLabel(actionType: string): string {
  switch (actionType) {
    case 'loan_created':
      return 'Loan Created'
    case 'status_changed_manual':
      return 'Status Changed (Manual)'
    case 'status_changed_auto':
      return 'Status Changed (Auto)'
    case 'loan_deleted':
      return 'Loan Deleted'
    default:
      return actionType
  }
}

function getActionClass(actionType: string): string {
  switch (actionType) {
    case 'loan_created':
      return 'action-created'
    case 'status_changed_manual':
      return 'action-manual'
    case 'status_changed_auto':
      return 'action-auto'
    case 'loan_deleted':
      return 'action-deleted'
    default:
      return ''
  }
}

onMounted(() => {
  loadLogs()
})
</script>

<template>
  <div class="audit-log-viewer">
    <div class="header">
      <h2>Audit Log</h2>
      <button @click="loadLogs" class="refresh-btn">Refresh</button>
    </div>

    <div class="controls">
      <div class="filter-group">
        <label for="action-filter">Filter by Action:</label>
        <select id="action-filter" v-model="filterType">
          <option value="all">All Actions</option>
          <option value="loan_created">Loan Created</option>
          <option value="status_changed_manual">Status Changed (Manual)</option>
          <option value="status_changed_auto">Status Changed (Auto)</option>
          <option value="loan_deleted">Loan Deleted</option>
        </select>
      </div>

      <div class="search-group">
        <label for="search-input">Search:</label>
        <input
          id="search-input"
          v-model="searchTerm"
          type="text"
          placeholder="Search by applicant name or loan ID..."
        />
      </div>
    </div>

    <div v-if="processedLogs.length === 0" class="empty-state">
      <p v-if="allLogs.length === 0">No audit log entries yet.</p>
      <p v-else>No entries match your filters.</p>
    </div>

    <div v-else class="log-table-container">
      <table class="log-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>Applicant</th>
            <th>Loan ID</th>
            <th>Amount</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in processedLogs" :key="log.id">
            <td class="timestamp">{{ formatTimestamp(log.timestamp) }}</td>
            <td>
              <span class="action-badge" :class="getActionClass(log.actionType)">
                {{ getActionLabel(log.actionType) }}
              </span>
            </td>
            <td>{{ log.applicantName }}</td>
            <td class="loan-id">{{ log.loanId }}</td>
            <td class="amount">{{ formatAmount(log.loanAmount) }}</td>
            <td class="details">
              <span v-if="log.previousStatus && log.newStatus">
                {{ log.previousStatus }} → {{ log.newStatus }}
              </span>
              <span v-else-if="log.previousStatus">
                Status: {{ log.previousStatus }}
              </span>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="summary">
      Showing {{ processedLogs.length }} of {{ allLogs.length }} entries
    </div>
  </div>
</template>

<style scoped>
.audit-log-viewer {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h2 {
  margin: 0;
  color: var(--primary-color);
}

.refresh-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: var(--primary-hover);
}

.controls {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-group,
.search-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group {
  flex: 0 0 250px;
}

.search-group {
  flex: 1;
  min-width: 300px;
}

.filter-group label,
.search-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.filter-group select,
.search-group input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-group input {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.log-table-container {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
}

.log-table th,
.log-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.log-table th {
  background: #f5f5f5;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.log-table tbody tr:hover {
  background: #f9f9f9;
}

.timestamp {
  white-space: nowrap;
  font-size: 0.85rem;
  color: #666;
}

.loan-id {
  font-family: monospace;
  font-size: 0.85rem;
  color: #666;
}

.amount {
  font-weight: 600;
  white-space: nowrap;
}

.details {
  font-size: 0.9rem;
  color: #555;
}

.action-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.action-created {
  background: #e8f5e9;
  color: #2e7d32;
}

.action-manual {
  background: #e3f2fd;
  color: #1565c0;
}

.action-auto {
  background: #fff3e0;
  color: #e65100;
}

.action-deleted {
  background: #ffebee;
  color: #c62828;
}

.summary {
  text-align: center;
  padding: 1rem;
  color: #666;
  font-size: 0.9rem;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
  }

  .filter-group,
  .search-group {
    flex: 1;
    width: 100%;
  }

  .log-table {
    font-size: 0.85rem;
  }

  .log-table th,
  .log-table td {
    padding: 0.5rem;
  }
}
</style>
