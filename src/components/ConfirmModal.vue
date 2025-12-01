<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  title: string
  message: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('cancel')
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    window.addEventListener('keydown', handleEscape)
  } else {
    window.removeEventListener('keydown', handleEscape)
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click="emit('cancel')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ title }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button class="ghost-btn" @click="emit('cancel')">
            Cancel
          </button>
          <button class="danger-btn" @click="emit('confirm')">
            Delete
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--modal-z-index, 1000);
}

.modal-content {
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  min-width: 400px;
  max-width: 500px;
  margin: 1rem;
}

.modal-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.modal-footer {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.ghost-btn {
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.ghost-btn:hover {
  background-color: var(--hover-background, #f8f9fa);
  border-color: var(--text-secondary);
}

.danger-btn {
  background-color: var(--danger-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.danger-btn:hover {
  background-color: var(--danger-hover-color, #c82333);
}

.danger-btn:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .modal-content {
    min-width: 300px;
    max-width: 90vw;
  }
}
</style>
