# 📋 Changelog

Toutes les modifications notables de ce projet seront documentées ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [0.1.0] - 2025-12-17

### ✨ Ajouté (Added)

#### ÉTAPE 1A : Structure Monorepo
- Configuration pnpm workspaces (`pnpm-workspace.yaml`)
- Package.json racine avec scripts globaux
  - `pnpm dev` : Lance tous les projets en parallèle
  - `pnpm build` : Compile tous les packages
  - `pnpm test` : Exécute tous les tests
  - `pnpm test:cov` : Tests avec couverture
- Configuration TypeScript partagée avec path aliases
  - `@webudget/shared-types` → `packages/shared-types/src`
  - `@webudget/shared-utils` → `packages/shared-utils/src`
- Configuration Prettier (formatage de code)
- `.nvmrc` pour forcer Node.js 20.11.0
- `.gitignore` complet
- `README.md` avec architecture complète

#### ÉTAPE 1B : Package shared-types
- **11 Enums**
  - `UserRole` : USER, ADMIN, PREMIUM
  - `AccountType` : PERSONAL, SHARED
  - `Currency` : EUR, USD, GBP, CAD, AUD, JPY, CHF, INR, SGD
  - `TransactionCategory` : FOOD, TRANSPORT, HOUSING, etc.
  - `TransactionType` : INCOME, EXPENSE, TRANSFER
  - `ParticipantStatus` : INVITED, ACCEPTED, DECLINED
  - `SettlementStatus` : PENDING, PAID, CANCELLED
  - `MessageType` : TEXT, IMAGE, FILE, SYSTEM
  - `ChatGroupType` : DIRECT, GROUP, EVENT_LINKED
  - `NotificationType` : EVENT_INVITATION, PAYMENT_REMINDER, etc.
  - `RecurrenceFrequency` : DAILY, WEEKLY, MONTHLY, YEARLY

- **13 Entités**
  - `User` : Utilisateur de l'application
  - `Account` : Compte financier (personnel ou partagé)
  - `AccountMember` : Membre d'un compte partagé
  - `Transaction` : Transaction financière
  - `RecurringTransaction` : Template de transaction récurrente
  - `Event` : Événement (sortie, voyage, etc.)
  - `EventParticipant` : Participant à un événement
  - `EventExpense` : Dépense partagée lors d'un événement
  - `Settlement` : Remboursement entre participants
  - `ChatGroup` : Groupe de chat
  - `ChatMember` : Membre d'un groupe de chat
  - `Message` : Message dans un chat
  - `Notification` : Notification utilisateur

- **23 DTOs (Data Transfer Objects)**
  - Auth : `RegisterDto`, `LoginDto`, `UpdateProfileDto`
  - Accounts : `CreateAccountDto`, `UpdateAccountDto`, `AddAccountMemberDto`
  - Transactions : `CreateTransactionDto`, `UpdateTransactionDto`, `TransactionFilterDto`
  - Recurring : `CreateRecurringTransactionDto`
  - Events : `CreateEventDto`, `UpdateEventDto`, `RespondToEventDto`
  - Expenses : `CreateEventExpenseDto`, `MarkSettlementPaidDto`
  - Messages : `SendMessageDto`, `MarkMessagesReadDto`
  - Pagination : `PaginationDto`, `PaginatedResponse<T>`

- **Tests Jest**
  - 44 tests avec 100% de couverture
  - Tests pour enums, entités, DTOs, exports

### 🔧 Configuration (Infrastructure)
- Jest configuré avec ts-jest
- Couverture de code minimale : 80%
- TypeScript strict mode activé
- Configuration de build séparée (`tsconfig.build.json`)

---

## 📝 Format des versions

### Types de changements
- **✨ Ajouté (Added)** : Nouvelles fonctionnalités
- **🔄 Modifié (Changed)** : Modifications de fonctionnalités existantes
- **⚠️ Obsolète (Deprecated)** : Fonctionnalités qui seront supprimées
- **🗑️ Supprimé (Removed)** : Fonctionnalités supprimées
- **🐛 Corrigé (Fixed)** : Corrections de bugs
- **🔒 Sécurité (Security)** : Corrections de vulnérabilités

### Semantic Versioning
- **MAJOR** (1.0.0) : Breaking changes (incompatible)
- **MINOR** (0.1.0) : Nouvelles fonctionnalités (compatible)
- **PATCH** (0.0.1) : Corrections de bugs (compatible)

---

## 🚀 Prochaines étapes

### [0.2.0] - ÉTAPE 1C (À venir)
- Docker Compose avec PostgreSQL
- Service d'authentification (NestJS)
- Prisma ORM avec migrations
- JWT authentication
- Tests E2E

### [0.3.0] - ÉTAPE 1D (À venir)
- Frontend Vue 3 + TypeScript
- Intégration vue3-ui-kit
- Pages Login/Register
- State management avec Pinia

### [0.4.0] - ÉTAPE 1E (À venir)
- CI/CD avec GitHub Actions
- Configuration Changesets
- Pipeline de tests automatisés
