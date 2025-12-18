<template>
  <div class="chat-view">
    <div class="chat-container">
      <!-- Rooms List -->
      <div class="rooms-sidebar">
        <div class="sidebar-header">
          <h2>💬 Conversations</h2>
          <button @click="showCreateRoomModal = true" class="btn-icon">➕</button>
        </div>

        <div class="rooms-list">
          <div
            v-for="room in rooms"
            :key="room.id"
            class="room-item"
            :class="{ active: selectedRoom?.id === room.id }"
            @click="selectRoom(room)"
          >
            <div class="room-info">
              <div class="room-name">{{ room.name }}</div>
              <div class="room-members">
                {{ room.members.length }} membre(s)
              </div>
            </div>
            <div v-if="room.messages[0]" class="last-message">
              {{ room.messages[0].content.slice(0, 30) }}...
            </div>
          </div>

          <div v-if="rooms.length === 0" class="empty-state">
            <p>Aucune conversation</p>
            <button @click="showCreateRoomModal = true">Créer une conversation</button>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="chat-area">
        <div v-if="!selectedRoom" class="no-room-selected">
          <div class="placeholder">
            <h3>Sélectionnez une conversation</h3>
            <p>Choisissez une conversation ou créez-en une nouvelle</p>
          </div>
        </div>

        <div v-else class="chat-content">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="room-title">
              <h3>{{ selectedRoom.name }}</h3>
              <div class="members-count">
                {{ selectedRoom.members.length }} membre(s)
              </div>
            </div>
            <button @click="showMembersModal = true" class="btn-secondary">
              👥 Membres
            </button>
          </div>

          <!-- Messages -->
          <div class="messages-container" ref="messagesContainer">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message"
              :class="{ own: message.userId === currentUserId }"
            >
              <div class="message-avatar">
                {{ message.user.name.charAt(0).toUpperCase() }}
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-author">{{ message.user.name }}</span>
                  <span class="message-time">{{ formatTime(message.createdAt) }}</span>
                </div>
                <div class="message-text">{{ message.content }}</div>
              </div>
            </div>

            <div v-if="messages.length === 0" class="empty-messages">
              <p>Aucun message. Commencez la conversation !</p>
            </div>
          </div>

          <!-- Message Input -->
          <div class="message-input-container">
            <form @submit.prevent="sendMessage">
              <input
                v-model="newMessage"
                type="text"
                placeholder="Écrivez votre message..."
                class="message-input"
              />
              <button type="submit" class="btn-send" :disabled="!newMessage.trim()">
                📤
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Room Modal -->
    <div v-if="showCreateRoomModal" class="modal-overlay" @click="showCreateRoomModal = false">
      <div class="modal" @click.stop>
        <h2>Nouvelle Conversation</h2>
        <form @submit.prevent="createRoom">
          <div class="form-group">
            <label>Nom de la conversation</label>
            <input v-model="newRoom.name" type="text" required />
          </div>
          <div class="form-group">
            <label>ID du compte associé</label>
            <input v-model.number="newRoom.accountId" type="number" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateRoomModal = false">Annuler</button>
            <button type="submit">Créer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Members Modal -->
    <div v-if="showMembersModal" class="modal-overlay" @click="showMembersModal = false">
      <div class="modal" @click.stop>
        <h2>Membres de la conversation</h2>
        <div class="members-list">
          <div v-for="member in selectedRoom?.members" :key="member.id" class="member-item">
            <div class="member-avatar">
              {{ member.user.name.charAt(0).toUpperCase() }}
            </div>
            <div class="member-info">
              <div class="member-name">{{ member.user.name }}</div>
              <div class="member-email">{{ member.user.email }}</div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showMembersModal = false">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { io, Socket } from 'socket.io-client'

const API_URL = 'http://localhost:3004'
const router = useRouter()

const rooms = ref<any[]>([])
const selectedRoom = ref<any>(null)
const messages = ref<any[]>([])
const newMessage = ref('')
const showCreateRoomModal = ref(false)
const showMembersModal = ref(false)
const newRoom = ref({ name: '', accountId: 1 })
const messagesContainer = ref<HTMLElement | null>(null)
const currentUserId = ref<number>(0)

let socket: Socket | null = null

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken')
  return { Authorization: `Bearer ${token}` }
}

function getUserId() {
  const token = localStorage.getItem('accessToken')
  if (!token) return 0
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || 0
  } catch {
    return 0
  }
}

async function loadRooms() {
  try {
    const response = await axios.get(`${API_URL}/chat/rooms`, {
      headers: getAuthHeaders(),
    })
    rooms.value = response.data
  } catch (error: any) {
    console.error('Erreur chargement rooms:', error)
    if (error.response?.status === 401) {
      router.push('/login')
    }
  }
}

async function selectRoom(room: any) {
  selectedRoom.value = room
  await loadMessages(room.id)

  // Join room via WebSocket
  if (socket) {
    socket.emit('joinRoom', { roomId: room.id })
  }
}

async function loadMessages(roomId: number) {
  try {
    const response = await axios.get(`${API_URL}/chat/rooms/${roomId}/messages`, {
      headers: getAuthHeaders(),
    })
    messages.value = response.data
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Erreur chargement messages:', error)
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !selectedRoom.value) return

  try {
    // Send via WebSocket
    if (socket) {
      socket.emit('sendMessage', {
        roomId: selectedRoom.value.id,
        content: newMessage.value,
      })
      newMessage.value = ''
    }
  } catch (error) {
    console.error('Erreur envoi message:', error)
  }
}

async function createRoom() {
  try {
    const response = await axios.post(
      `${API_URL}/chat/rooms`,
      newRoom.value,
      {
        headers: getAuthHeaders(),
      }
    )
    rooms.value.push(response.data)
    showCreateRoomModal.value = false
    newRoom.value = { name: '', accountId: 1 }
    selectRoom(response.data)
  } catch (error) {
    console.error('Erreur création room:', error)
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function initWebSocket() {
  currentUserId.value = getUserId()
  
  socket = io('http://localhost:3004', {
    auth: {
      userId: currentUserId.value,
    },
  })

  socket.on('connect', () => {
    console.log('Connected to chat WebSocket')
  })

  socket.on('newMessage', (message: any) => {
    if (selectedRoom.value && message.roomId === selectedRoom.value.id) {
      messages.value.push(message)
      nextTick(() => scrollToBottom())
    }
  })

  socket.on('disconnect', () => {
    console.log('Disconnected from chat WebSocket')
  })
}

onMounted(async () => {
  await loadRooms()
  initWebSocket()
})

watch(selectedRoom, (newRoom, oldRoom) => {
  if (oldRoom && socket) {
    socket.emit('leaveRoom', { roomId: oldRoom.id })
  }
})
</script>

<style scoped>
.chat-view {
  padding: 20px;
}

.chat-container {
  display: flex;
  height: calc(100vh - 100px);
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rooms-sidebar {
  width: 320px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
}

.btn-icon {
  background: #3b82f6;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
}

.btn-icon:hover {
  background: #2563eb;
}

.rooms-list {
  flex: 1;
  overflow-y: auto;
}

.room-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.2s;
}

.room-item:hover {
  background: #f9fafb;
}

.room-item.active {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.room-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.room-name {
  font-weight: 600;
  font-size: 14px;
}

.room-members {
  font-size: 12px;
  color: #6b7280;
}

.last-message {
  font-size: 13px;
  color: #9ca3af;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.no-room-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.placeholder {
  text-align: center;
  color: #9ca3af;
}

.placeholder h3 {
  margin: 0 0 8px 0;
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-title h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
}

.members-count {
  font-size: 13px;
  color: #6b7280;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
}

.message.own {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.message.own .message-avatar {
  background: #10b981;
}

.message-content {
  max-width: 60%;
}

.message.own .message-content {
  text-align: right;
}

.message-header {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 13px;
}

.message.own .message-header {
  flex-direction: row-reverse;
}

.message-author {
  font-weight: 600;
  color: #374151;
}

.message-time {
  color: #9ca3af;
}

.message-text {
  background: #f3f4f6;
  padding: 10px 14px;
  border-radius: 12px;
  display: inline-block;
  text-align: left;
}

.message.own .message-text {
  background: #3b82f6;
  color: white;
}

.message-input-container {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.message-input-container form {
  display: flex;
  gap: 12px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  font-size: 14px;
}

.message-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn-send {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 20px;
}

.btn-send:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.btn-send:hover:not(:disabled) {
  background: #2563eb;
}

.empty-state,
.empty-messages {
  text-align: center;
  color: #9ca3af;
  padding: 40px 20px;
}

.empty-state button {
  margin-top: 16px;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
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
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
}

.modal h2 {
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.modal-actions button[type='submit'],
.btn-secondary {
  background: #3b82f6;
  color: white;
}

.modal-actions button[type='button'] {
  background: #e5e7eb;
}

.members-list {
  max-height: 400px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.member-email {
  font-size: 13px;
  color: #6b7280;
}

.btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
</style>
