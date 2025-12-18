<template>
  <div class="accounts-view">
    <div class="header">
      <h1>💰 Mes Comptes</h1>
      <button @click="showCreateModal = true" class="btn-primary">
        ➕ Nouveau Compte
      </button>
    </div>

    <!-- Liste des comptes personnels -->
    <section v-if="accounts.owned.length > 0" class="accounts-section">
      <h2>📱 Comptes Personnels</h2>
      <div class="accounts-grid">
        <div
          v-for="account in accounts.owned"
          :key="account.id"
          class="account-card"
          @click="selectAccount(account)"
        >
          <div class="account-header">
            <h3>{{ account.name }}</h3>
            <span class="account-type">{{ account.type }}</span>
          </div>
          <div class="account-balance">
            <span class="amount">{{ formatAmount(account.balance) }}</span>
            <span class="currency">{{ account.currency }}</span>
          </div>
          <div class="account-footer">
            <span>{{ account._count?.transactions || 0 }} transactions</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Liste des comptes partagés -->
    <section v-if="accounts.shared.length > 0" class="accounts-section">
      <h2>👥 Comptes Partagés</h2>
      <div class="accounts-grid">
        <div
          v-for="membership in accounts.shared"
          :key="membership.id"
          class="account-card shared"
          @click="selectAccount(membership.account)"
        >
          <div class="account-header">
            <h3>{{ membership.account.name }}</h3>
            <span class="account-type">{{ membership.account.type }}</span>
          </div>
          <div class="account-balance">
            <span class="amount">{{ formatAmount(membership.account.balance) }}</span>
            <span class="currency">{{ membership.account.currency }}</span>
          </div>
          <div class="account-footer">
            <span>Rôle: {{ membership.role }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- État vide -->
    <div v-if="accounts.owned.length === 0 && accounts.shared.length === 0" class="empty-state">
      <p>🏦 Vous n'avez encore aucun compte</p>
      <button @click="showCreateModal = true" class="btn-primary">
        Créer votre premier compte
      </button>
    </div>

    <!-- Modal de création de compte -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <h2>➕ Nouveau Compte</h2>
        <form @submit.prevent="createAccount">
          <div class="form-group">
            <label>Nom du compte</label>
            <input v-model="newAccount.name" type="text" required placeholder="Ex: Compte Courant" />
          </div>
          <div class="form-group">
            <label>Type</label>
            <select v-model="newAccount.type" required>
              <option value="PERSONAL">Personnel</option>
              <option value="SHARED">Partagé</option>
            </select>
          </div>
          <div class="form-group">
            <label>Devise</label>
            <select v-model="newAccount.currency">
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CHF">CHF</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
          <div class="form-group">
            <label>Solde initial (optionnel)</label>
            <input v-model.number="newAccount.balance" type="number" step="0.01" min="0" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Création...' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

interface Account {
  id: number
  name: string
  type: string
  balance: number
  currency: string
  _count?: { transactions: number }
}

interface AccountMembership {
  id: number
  role: string
  account: Account
}

const accounts = ref<{ owned: Account[]; shared: AccountMembership[] }>({
  owned: [],
  shared: []
})
const showCreateModal = ref(false)
const loading = ref(false)
const newAccount = ref({
  name: '',
  type: 'PERSONAL',
  currency: 'EUR',
  balance: 0
})

const API_URL = 'http://localhost:3002'

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken')
  return { Authorization: `Bearer ${token}` }
}

async function loadAccounts() {
  try {
    const response = await axios.get(`${API_URL}/accounts`, {
      headers: getAuthHeaders()
    })
    accounts.value = response.data
  } catch (error) {
    console.error('Erreur chargement comptes:', error)
    alert('Impossible de charger les comptes')
  }
}

async function createAccount() {
  loading.value = true
  try {
    await axios.post(`${API_URL}/accounts`, newAccount.value, {
      headers: getAuthHeaders()
    })
    showCreateModal.value = false
    newAccount.value = { name: '', type: 'PERSONAL', currency: 'EUR', balance: 0 }
    await loadAccounts()
  } catch (error) {
    console.error('Erreur création compte:', error)
    alert('Impossible de créer le compte')
  } finally {
    loading.value = false
  }
}

function selectAccount(account: Account) {
  router.push(`/accounts/${account.id}`)
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

onMounted(() => {
  loadAccounts()
})
</script>

<style scoped>
.accounts-view {
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

.accounts-section {
  margin-bottom: 3rem;
}

.accounts-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.account-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.account-card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.account-card.shared {
  border-color: #10b981;
}

.account-card.shared:hover {
  border-color: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.account-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.account-type {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 600;
}

.account-balance {
  margin-bottom: 1rem;
}

.amount {
  font-size: 2rem;
  font-weight: 700;
  color: #6366f1;
}

.currency {
  font-size: 1rem;
  color: #6b7280;
  margin-left: 0.5rem;
}

.account-footer {
  color: #6b7280;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state p {
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
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
