<template>
  <div class="events-view">
    <div class="header">
      <h1>🔔 Événements & Notifications</h1>
      <button @click="markAllAsRead" class="btn-primary" v-if="stats.pending > 0">
        ✅ Tout marquer comme lu
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card pending">
        <div class="stat-label">En attente</div>
        <div class="stat-value">{{ stats.pending }}</div>
      </div>
      <div class="stat-card read">
        <div class="stat-label">Lus</div>
        <div class="stat-value">{{ stats.read }}</div>
      </div>
      <div class="stat-card archived">
        <div class="stat-label">Archivés</div>
        <div class="stat-value">{{ stats.archived }}</div>
      </div>
      <div class="stat-card total">
        <div class="stat-label">Total</div>
        <div class="stat-value">{{ stats.total }}</div>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="tabs">
      <button
        @click="filter = 'all'"
        :class="{ active: filter === 'all' }"
      >
        Tous
      </button>
      <button
        @click="filter = 'PENDING'"
        :class="{ active: filter === 'PENDING' }"
      >
        En attente
      </button>
      <button
        @click="filter = 'READ'"
        :class="{ active: filter === 'READ' }"
      >
        Lus
      </button>
    </div>

    <!-- Events list -->
    <div v-if="filteredEvents.length > 0" class="events-list">
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="event-item"
        :class="[event.status.toLowerCase(), event.type.toLowerCase()]"
        @click="handleEventClick(event)"
      >
        <div class="event-icon">{{ getEventIcon(event.type) }}</div>
        <div class="event-details">
          <div class="event-title">{{ event.title }}</div>
          <div class="event-description" v-if="event.description">
            {{ event.description }}
          </div>
          <div class="event-date">{{ formatDate(event.createdAt) }}</div>
        </div>
        <div class="event-actions">
          <button
            v-if="event.status === 'PENDING'"
            @click.stop="markAsRead(event.id)"
            class="btn-small"
          >
            ✓
          </button>
          <button
            @click.stop="archiveEvent(event.id)"
            class="btn-small"
          >
            🗂️
          </button>
          <button
            @click.stop="deleteEvent(event.id)"
            class="btn-small danger"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>📭 Aucun événement</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

interface Event {
  id: number
  type: string
  title: string
  description?: string
  status: string
  createdAt: string
  metadata?: any
}

const events = ref<Event[]>([])
const stats = ref({ total: 0, pending: 0, read: 0, archived: 0 })
const filter = ref<'all' | 'PENDING' | 'READ' | 'ARCHIVED'>('all')

const API_URL = 'http://localhost:3003'

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken')
  return { Authorization: `Bearer ${token}` }
}

const filteredEvents = computed(() => {
  if (filter.value === 'all') return events.value
  return events.value.filter((e) => e.status === filter.value)
})

async function loadEvents() {
  try {
    const response = await axios.get(`${API_URL}/events`, {
      headers: getAuthHeaders()
    })
    events.value = response.data
  } catch (error) {
    console.error('Erreur chargement événements:', error)
  }
}

async function loadStats() {
  try {
    const response = await axios.get(`${API_URL}/events/stats`, {
      headers: getAuthHeaders()
    })
    stats.value = response.data
  } catch (error) {
    console.error('Erreur chargement stats:', error)
  }
}

async function markAsRead(id: number) {
  try {
    await axios.put(`${API_URL}/events/${id}`, { status: 'READ' }, {
      headers: getAuthHeaders()
    })
    await loadEvents()
    await loadStats()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

async function archiveEvent(id: number) {
  try {
    await axios.put(`${API_URL}/events/${id}`, { status: 'ARCHIVED' }, {
      headers: getAuthHeaders()
    })
    await loadEvents()
    await loadStats()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

async function deleteEvent(id: number) {
  if (!confirm('Supprimer cet événement ?')) return
  
  try {
    await axios.delete(`${API_URL}/events/${id}`, {
      headers: getAuthHeaders()
    })
    await loadEvents()
    await loadStats()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

async function markAllAsRead() {
  try {
    const pendingEvents = events.value.filter(e => e.status === 'PENDING')
    await Promise.all(
      pendingEvents.map(e => 
        axios.put(`${API_URL}/events/${e.id}`, { status: 'READ' }, {
          headers: getAuthHeaders()
        })
      )
    )
    await loadEvents()
    await loadStats()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

function handleEventClick(event: Event) {
  if (event.status === 'PENDING') {
    markAsRead(event.id)
  }
}

function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    BUDGET_LIMIT: '⚠️',
    RECURRING_DUE: '🔄',
    LOW_BALANCE: '💸',
    LARGE_TRANSACTION: '💰',
    ACCOUNT_SHARED: '👥',
    REMINDER: '⏰'
  }
  return icons[type] || '📋'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadEvents()
  loadStats()
})
</script>

<style scoped>
.events-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
}

.stat-card.pending {
  border-color: #f59e0b;
}

.stat-card.read {
  border-color: #10b981;
}

.stat-card.archived {
  border-color: #6b7280;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.stat-card.pending .stat-value {
  color: #f59e0b;
}

.stat-card.read .stat-value {
  color: #10b981;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.tabs button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tabs button.active {
  color: #6366f1;
  border-bottom-color: #6366f1;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.event-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.event-item.pending {
  border-color: #f59e0b;
  background: #fffbeb;
}

.event-item.read {
  opacity: 0.7;
}

.event-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.event-details {
  flex: 1;
}

.event-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.event-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.event-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.5rem;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-small:hover {
  background: #e5e7eb;
}

.btn-small.danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #6b7280;
  font-size: 1.25rem;
}

.btn-primary {
  background: #6366f1;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #4f46e5;
}
</style>
