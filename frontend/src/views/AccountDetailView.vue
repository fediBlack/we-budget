<template>
  <div class="account-detail-view">
    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else-if="account" class="content">
      <!-- En-tête du compte -->
      <div class="account-header">
        <button @click="$router.back()" class="btn-back">← Retour</button>
        <div class="account-info">
          <h1>{{ account.name }}</h1>
          <div class="balance">
            <span class="amount">{{ formatAmount(account.balance) }}</span>
            <span class="currency">{{ account.currency }}</span>
          </div>
        </div>
        <button @click="showAddTransaction = true" class="btn-primary">
          ➕ Nouvelle Transaction
        </button>
      </div>

      <!-- Statistiques -->
      <div v-if="stats" class="stats-grid">
        <div class="stat-card income">
          <div class="stat-label">Revenus</div>
          <div class="stat-value">+{{ formatAmount(stats.totalIncome) }} {{ account.currency }}</div>
        </div>
        <div class="stat-card expense">
          <div class="stat-label">Dépenses</div>
          <div class="stat-value">-{{ formatAmount(stats.totalExpense) }} {{ account.currency }}</div>
        </div>
        <div class="stat-card balance">
          <div class="stat-label">Solde</div>
          <div class="stat-value">{{ formatAmount(stats.balance) }} {{ account.currency }}</div>
        </div>
        <div class="stat-card count">
          <div class="stat-label">Transactions</div>
          <div class="stat-value">{{ stats.transactionCount }}</div>
        </div>
      </div>

      <!-- Liste des transactions -->
      <div class="transactions-section">
        <h2>📋 Transactions</h2>
        <div v-if="account.transactions && account.transactions.length > 0" class="transactions-list">
          <div
            v-for="transaction in account.transactions"
            :key="transaction.id"
            class="transaction-item"
            :class="transaction.type.toLowerCase()"
          >
            <div class="transaction-icon">
              {{ transaction.type === 'INCOME' ? '💰' : '💸' }}
            </div>
            <div class="transaction-details">
              <div class="transaction-category">{{ formatCategory(transaction.category) }}</div>
              <div class="transaction-description">{{ transaction.description || '-' }}</div>
              <div class="transaction-date">{{ formatDate(transaction.date) }}</div>
            </div>
            <div class="transaction-amount" :class="transaction.type.toLowerCase()">
              {{ transaction.type === 'INCOME' ? '+' : '-' }}{{ formatAmount(transaction.amount) }}
              {{ account.currency }}
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>Aucune transaction pour le moment</p>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout de transaction -->
    <div v-if="showAddTransaction" class="modal-overlay" @click.self="showAddTransaction = false">
      <div class="modal">
        <h2>➕ Nouvelle Transaction</h2>
        <form @submit.prevent="createTransaction">
          <div class="form-group">
            <label>Type</label>
            <select v-model="newTransaction.type" required>
              <option value="INCOME">Revenu</option>
              <option value="EXPENSE">Dépense</option>
            </select>
          </div>
          <div class="form-group">
            <label>Catégorie</label>
            <select v-model="newTransaction.category" required>
              <optgroup v-if="newTransaction.type === 'INCOME'" label="Revenus">
                <option value="SALARY">Salaire</option>
                <option value="FREELANCE">Freelance</option>
                <option value="INVESTMENT">Investissement</option>
                <option value="OTHER_INCOME">Autre revenu</option>
              </optgroup>
              <optgroup v-if="newTransaction.type === 'EXPENSE'" label="Dépenses">
                <option value="FOOD">Alimentation</option>
                <option value="TRANSPORT">Transport</option>
                <option value="HOUSING">Logement</option>
                <option value="UTILITIES">Factures</option>
                <option value="HEALTHCARE">Santé</option>
                <option value="ENTERTAINMENT">Loisirs</option>
                <option value="SHOPPING">Shopping</option>
                <option value="EDUCATION">Éducation</option>
                <option value="SAVINGS">Épargne</option>
                <option value="OTHER_EXPENSE">Autre dépense</option>
              </optgroup>
            </select>
          </div>
          <div class="form-group">
            <label>Montant</label>
            <input v-model.number="newTransaction.amount" type="number" step="0.01" min="0.01" required />
          </div>
          <div class="form-group">
            <label>Description (optionnel)</label>
            <input v-model="newTransaction.description" type="text" placeholder="Ex: Courses du lundi" />
          </div>
          <div class="form-group">
            <label>Date</label>
            <input v-model="newTransaction.date" type="date" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddTransaction = false" class="btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Ajout...' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const accountId = computed(() => Number(route.params.id))

interface Transaction {
  id: number
  amount: number
  type: string
  category: string
  description?: string
  date: string
}

interface Account {
  id: number
  name: string
  balance: number
  currency: string
  transactions?: Transaction[]
}

interface Stats {
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
}

const account = ref<Account | null>(null)
const stats = ref<Stats | null>(null)
const loading = ref(true)
const showAddTransaction = ref(false)
const submitting = ref(false)
const newTransaction = ref({
  type: 'EXPENSE',
  category: 'FOOD',
  amount: 0,
  description: '',
  date: new Date().toISOString().split('T')[0]
})

const API_URL = 'http://localhost:3002'

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken')
  return { Authorization: `Bearer ${token}` }
}

async function loadAccount() {
  loading.value = true
  try {
    const response = await axios.get(`${API_URL}/accounts/${accountId.value}`, {
      headers: getAuthHeaders()
    })
    account.value = response.data
    await loadStats()
  } catch (error) {
    console.error('Erreur chargement compte:', error)
    alert('Impossible de charger le compte')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const response = await axios.get(`${API_URL}/transactions/stats/${accountId.value}`, {
      headers: getAuthHeaders()
    })
    stats.value = response.data
  } catch (error) {
    console.error('Erreur chargement stats:', error)
  }
}

async function createTransaction() {
  submitting.value = true
  try {
    await axios.post(
      `${API_URL}/transactions`,
      {
        accountId: accountId.value,
        ...newTransaction.value
      },
      { headers: getAuthHeaders() }
    )
    showAddTransaction.value = false
    newTransaction.value = {
      type: 'EXPENSE',
      category: 'FOOD',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0]
    }
    await loadAccount()
  } catch (error) {
    console.error('Erreur création transaction:', error)
    alert('Impossible de créer la transaction')
  } finally {
    submitting.value = false
  }
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatCategory(category: string): string {
  const categories: Record<string, string> = {
    SALARY: '💼 Salaire',
    FREELANCE: '💻 Freelance',
    INVESTMENT: '📈 Investissement',
    OTHER_INCOME: '💰 Autre revenu',
    FOOD: '🍔 Alimentation',
    TRANSPORT: '🚗 Transport',
    HOUSING: '🏠 Logement',
    UTILITIES: '💡 Factures',
    HEALTHCARE: '🏥 Santé',
    ENTERTAINMENT: '🎬 Loisirs',
    SHOPPING: '🛍️ Shopping',
    EDUCATION: '📚 Éducation',
    SAVINGS: '💎 Épargne',
    OTHER_EXPENSE: '💸 Autre dépense'
  }
  return categories[category] || category
}

onMounted(() => {
  loadAccount()
})
</script>

<style scoped>
.account-detail-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 4rem;
  font-size: 1.25rem;
  color: #6b7280;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

.btn-back {
  background: #f3f4f6;
  color: #374151;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #e5e7eb;
}

.account-info {
  flex: 1;
}

.account-info h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.balance {
  font-size: 1.5rem;
}

.amount {
  font-weight: 700;
  color: #6366f1;
}

.currency {
  color: #6b7280;
  margin-left: 0.5rem;
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

.stat-card.income {
  border-color: #10b981;
}

.stat-card.expense {
  border-color: #ef4444;
}

.stat-card.balance {
  border-color: #6366f1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-card.income .stat-value {
  color: #10b981;
}

.stat-card.expense .stat-value {
  color: #ef4444;
}

.stat-card.balance .stat-value {
  color: #6366f1;
}

.transactions-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.transactions-list {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-item:hover {
  background: #f9fafb;
}

.transaction-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.transaction-details {
  flex: 1;
}

.transaction-category {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.transaction-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.transaction-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.transaction-amount {
  font-size: 1.25rem;
  font-weight: 700;
}

.transaction-amount.income {
  color: #10b981;
}

.transaction-amount.expense {
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
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

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>
