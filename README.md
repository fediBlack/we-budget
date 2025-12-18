# 💰 WeBudget - Application de Gestion Budgétaire Collaborative

Application full-stack de gestion budgétaire avec architecture microservices, développée avec NestJS, Vue 3, et PostgreSQL.

![Version](https://img.shields.io/badge/version-0.8.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Démarrage rapide](#démarrage-rapide)
- [Services](#services)
- [Fonctionnalités](#fonctionnalités)
- [Développement](#développement)
- [Déploiement](#déploiement)
- [API Documentation](#api-documentation)
- [Tests](#tests)

## 🎯 Aperçu

WeBudget est une plateforme moderne de gestion budgétaire permettant aux utilisateurs de :
- Gérer plusieurs comptes bancaires
- Suivre leurs transactions en temps réel
- Partager des comptes avec d'autres utilisateurs
- Recevoir des notifications intelligentes
- Communiquer via chat intégré

## 🏗️ Architecture

### Microservices

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Vue 3)                   │
│                  http://localhost:5173               │
└─────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┬────────────┐
          │               │               │            │
┌─────────▼───┐  ┌───────▼────┐  ┌──────▼────┐  ┌────▼──────┐
│Auth Service │  │Financial   │  │Events     │  │Chat       │
│Port 3001    │  │Service     │  │Service    │  │Service    │
│             │  │Port 3002   │  │Port 3003  │  │Port 3004  │
└─────────────┘  └────────────┘  └───────────┘  └───────────┘
       │              │                 │             │
       └──────────────┴─────────────────┴─────────────┘
                          │
              ┌───────────▼────────────┐
              │   PostgreSQL :5432     │
              │  - webudget_auth       │
              │  - webudget_financial  │
              │  - webudget_events     │
              │  - webudget_chat       │
              └────────────────────────┘
```

### Bases de données

Chaque service possède sa propre base de données PostgreSQL :

- **webudget_auth** : Utilisateurs, tokens, sessions
- **webudget_financial** : Comptes, transactions, budgets
- **webudget_events** : Événements, notifications, préférences
- **webudget_chat** : Rooms, messages, membres

## 🛠️ Technologies

### Backend
- **NestJS** 10.x - Framework Node.js
- **Prisma** 5.x - ORM moderne
- **PostgreSQL** 16 - Base de données
- **Socket.IO** 4.x - WebSocket temps réel
- **Passport JWT** - Authentification
- **TypeScript** 5.x - Typage statique

### Frontend
- **Vue 3** - Framework progressif
- **TypeScript** - Typage statique
- **Vue Router** - Routing SPA
- **Pinia** - State management
- **Axios** - Client HTTP
- **Socket.IO Client** - WebSocket client

### DevOps
- **Docker** & **Docker Compose** - Conteneurisation
- **GitHub Actions** - CI/CD
- **pnpm** - Package manager rapide
- **Nginx** - Reverse proxy

## 🚀 Démarrage rapide

### Prérequis

- Node.js >= 20
- pnpm >= 10.25.0
- Docker & Docker Compose (optionnel)
- PostgreSQL 16 (si non Docker)

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/fediBlack/we-budget.git
cd webudget

# Installer les dépendances
pnpm install

# Démarrer PostgreSQL
docker-compose up -d postgres

# Démarrer les services backend
cd backend/auth-service && pnpm dev &
cd backend/financial-service && pnpm dev &
cd backend/events-service && pnpm dev &
cd backend/chat-service && pnpm dev &

# Démarrer le frontend
cd frontend && pnpm dev
```

### Déploiement Docker

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down
```

L'application sera accessible sur :
- Frontend : http://localhost:5173
- Auth API : http://localhost:3001
- Financial API : http://localhost:3002
- Events API : http://localhost:3003
- Chat API : http://localhost:3004
- Adminer (DB UI) : http://localhost:8080

## 📦 Services

### 1. Auth Service (Port 3001)

Service d'authentification avec JWT.

**Endpoints :**
- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter
- `POST /auth/refresh` - Rafraîchir le token
- `POST /auth/logout` - Se déconnecter
- `GET /auth/me` - Utilisateur actuel

**Modèles :**
- User (id, email, name, password, role)
- RefreshToken (id, token, userId, expiresAt)

### 2. Financial Service (Port 3002)

Gestion des comptes et transactions.

**Endpoints :**
- `GET /accounts` - Liste des comptes
- `POST /accounts` - Créer un compte
- `GET /accounts/:id` - Détails d'un compte
- `PATCH /accounts/:id` - Modifier un compte
- `DELETE /accounts/:id` - Supprimer un compte
- `GET /transactions` - Liste des transactions
- `POST /transactions` - Créer une transaction
- `GET /transactions/statistics` - Statistiques

**Modèles :**
- Account (id, name, type, balance, currency)
- Transaction (id, amount, type, category, date)
- AccountMember (partage de comptes)
- Budget (limites par catégorie)
- RecurringTransaction (transactions récurrentes)

### 3. Events Service (Port 3003)

Système de notifications et événements.

**Endpoints :**
- `GET /events` - Liste des événements
- `POST /events` - Créer un événement
- `PATCH /events/:id/read` - Marquer comme lu
- `PATCH /events/:id/archive` - Archiver
- `GET /notifications` - Notifications
- `GET /notifications/preferences` - Préférences
- `PUT /notifications/preferences` - Modifier préférences

**Modèles :**
- Event (id, type, title, description, status)
- Notification (id, channel, title, body)
- NotificationPreferences (userId, channels activés)
- Reminder (rappels personnalisés)

**Types d'événements :**
- BUDGET_LIMIT - Limite de budget atteinte
- RECURRING_DUE - Transaction récurrente due
- LOW_BALANCE - Solde faible
- LARGE_TRANSACTION - Transaction importante
- ACCOUNT_SHARED - Compte partagé
- REMINDER - Rappel personnalisé

### 4. Chat Service (Port 3004)

Chat temps réel pour les comptes partagés.

**Endpoints :**
- `GET /chat/rooms` - Liste des salons
- `POST /chat/rooms` - Créer un salon
- `POST /chat/rooms/:id/members` - Ajouter un membre
- `GET /chat/rooms/:id/messages` - Historique
- `POST /chat/messages` - Envoyer un message

**WebSocket Events :**
- `joinRoom` - Rejoindre un salon
- `leaveRoom` - Quitter un salon
- `sendMessage` - Envoyer un message
- `newMessage` - Nouveau message reçu

**Modèles :**
- Room (id, name, accountId)
- Message (id, content, userId, roomId)
- RoomMember (userId, roomId)

## ✨ Fonctionnalités

### Authentification
- ✅ Inscription / Connexion
- ✅ JWT Access + Refresh tokens
- ✅ Vérification email (à implémenter)
- ✅ Réinitialisation mot de passe (à implémenter)
- ✅ Rôles utilisateurs (USER, PREMIUM, ADMIN)

### Gestion financière
- ✅ Comptes multiples (CHECKING, SAVINGS, CREDIT_CARD, etc.)
- ✅ Transactions (INCOME, EXPENSE, TRANSFER)
- ✅ Calcul automatique des soldes
- ✅ Catégorisation (FOOD, TRANSPORT, HOUSING, etc.)
- ✅ Statistiques par catégorie
- ✅ Partage de comptes
- ✅ Multi-devises (EUR, USD, GBP, etc.)

### Notifications
- ✅ Événements automatiques
- ✅ Notifications en temps réel (WebSocket)
- ✅ Préférences par canal (IN_APP, EMAIL, PUSH)
- ✅ Rappels personnalisés
- ✅ Historique d'événements

### Chat
- ✅ Salons par compte partagé
- ✅ Messages temps réel (WebSocket)
- ✅ Historique des conversations
- ✅ Gestion des membres
- ✅ Interface utilisateur moderne

## 💻 Développement

### Structure du projet

```
webudget/
├── backend/
│   ├── auth-service/       # Service d'authentification
│   ├── financial-service/  # Service financier
│   ├── events-service/     # Service d'événements
│   └── chat-service/       # Service de chat
├── frontend/               # Application Vue 3
├── docker/
│   ├── postgres/          # Scripts PostgreSQL
│   └── nginx/             # Configuration Nginx
├── docker-compose.yml     # Orchestration services
└── PROGRESS.md           # Historique du développement
```

### Scripts disponibles

**Backend (chaque service) :**
```bash
pnpm dev              # Mode développement
pnpm build            # Build production
pnpm start:prod       # Démarrer en production
pnpm prisma:generate  # Générer client Prisma
pnpm prisma:migrate   # Appliquer migrations
pnpm test             # Tests unitaires
pnpm test:e2e         # Tests E2E
```

**Frontend :**
```bash
pnpm dev      # Mode développement
pnpm build    # Build production
pnpm preview  # Preview du build
pnpm lint     # Linter
```

### Variables d'environnement

Créer un fichier `.env` à la racine :

```env
# JWT Secrets
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key

# PostgreSQL
POSTGRES_USER=webudget
POSTGRES_PASSWORD=webudget_dev_2024

# Node Environment
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Migrations Prisma

```bash
# Créer une migration
pnpm prisma migrate dev --name migration_name

# Appliquer les migrations
pnpm prisma migrate deploy

# Reset la base de données
pnpm prisma migrate reset

# Ouvrir Prisma Studio
pnpm prisma studio
```

## 🐳 Déploiement

### Docker Compose (recommandé)

```bash
# Build et démarrer
docker-compose up -d --build

# Vérifier les services
docker-compose ps

# Voir les logs
docker-compose logs -f [service-name]

# Arrêter
docker-compose down

# Supprimer les volumes
docker-compose down -v
```

### Production

1. **Mettre à jour les secrets** dans `.env`
2. **Configurer Nginx** pour le reverse proxy
3. **Activer HTTPS** avec Let's Encrypt
4. **Configurer le monitoring** (Prometheus + Grafana)
5. **Mettre en place des sauvegardes** PostgreSQL

## 📚 API Documentation

### Authentification

Toutes les routes (sauf `/auth/register` et `/auth/login`) nécessitent un token JWT :

```bash
# Headers
Authorization: Bearer <access_token>
```

### Exemples de requêtes

**Inscription :**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

**Créer un compte :**
```bash
curl -X POST http://localhost:3002/accounts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Compte Courant",
    "type": "CHECKING",
    "currency": "EUR",
    "initialBalance": 1000
  }'
```

## 🧪 Tests

### Tests unitaires

```bash
# Backend (chaque service)
cd backend/auth-service
pnpm test

# Frontend
cd frontend
pnpm test:unit
```

### Tests E2E

```bash
# Backend
cd backend/auth-service
pnpm test:e2e
```

## 📈 Métriques

### État actuel
- ✅ 4/4 backend services (100%)
- ✅ 4/4 frontend views (100%)
- ✅ 8 releases (v0.1.0 - v0.8.0)
- ✅ 30+ tests E2E
- ✅ Docker ready

## 📝 Changelog

### v0.8.0 (Actuel)
- ✨ Chat Service avec WebSocket
- 💬 Messages temps réel
- 🏠 Salons de conversation

### v0.7.0
- 🔔 Events & Notifications Service
- ⚡ WebSocket notifications

### v0.6.0
- 💰 Financial Service complet
- 📊 Statistiques par catégorie

## 📄 License

MIT License

## 👥 Auteurs

- **Fedi Black** - [@fediBlack](https://github.com/fediBlack)

---

**Made with ❤️ by the WeBudget Team**
