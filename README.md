# WeBudget 💰

Plateforme moderne de gestion financière collaborative avec gestion d'événements et messagerie intégrée.

## 🏗️ Architecture

Monorepo utilisant pnpm workspaces avec :

### Backend (NestJS + PostgreSQL)
- **auth-service** (port 3001) - Authentification JWT
- **financial-service** (port 3002) - Comptes, transactions, budgets
- **event-service** (port 3003) - Événements, participants, dépenses partagées
- **chat-service** (port 3004) - Messagerie temps réel (WebSocket)
- **api-gateway** (port 3000) - Point d'entrée unique

### Frontend (Vue 3 + TypeScript)
- **webudget-app** (port 5173) - Application principale

### Packages Partagés
- **shared-types** - Types TypeScript (entités, DTOs, enums)
- **shared-utils** - Utilitaires communs

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
pnpm install

# Démarrer la base de données (Docker)
docker-compose up -d

# Générer les clients Prisma
pnpm db:generate

# Lancer les migrations
pnpm db:migrate

# Démarrer tous les services
pnpm dev

# Ou seulement le backend
pnpm dev:backend

# Ou seulement le frontend
pnpm dev:frontend
```

## 📦 Stack Technique

- **Backend**: NestJS, Prisma, PostgreSQL, JWT, Socket.IO
- **Frontend**: Vue 3, TypeScript, Vite, Pinia, vue3-ui-kit
- **Tests**: Jest (backend), Vitest (frontend), Playwright (E2E)
- **CI/CD**: GitHub Actions, Changesets
- **Monorepo**: pnpm workspaces

## 🧪 Tests

```bash
# Tests unitaires
pnpm test

# Tests avec coverage
pnpm test:cov

# Tests E2E
pnpm test:e2e
```

## 📚 Documentation

- [Architecture détaillée](docs/architecture.md)
- [Guide de contribution](CONTRIBUTING.md)
- [API Reference](docs/api-reference.md)

## 📝 License

MIT
