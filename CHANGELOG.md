# 📋 Changelog

Toutes les modifications notables de ce projet seront documentées ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [0.3.0] - 2025-12-17

### ✨ Ajouté (Added)

#### ÉTAPE 1D : Frontend Vue 3 avec Authentification

**Application Vue 3**
- Vite comme bundler de développement (HMR ultra-rapide)
- TypeScript strict mode
- Pinia pour state management
- Vue Router avec navigation guards
- Tailwind CSS pour le styling
- Port de développement : 5173

**Gestion de l'authentification (Pinia Store)**
- Store `useAuthStore` avec état réactif :
  - `user` : Objet utilisateur connecté (id, email, name, role, avatar)
  - `accessToken` / `refreshToken` : Tokens JWT
  - `isAuthenticated` : Computed property (booléen)
  - `isAdmin` / `isPremium` : Rôles utilisateur
- Actions asynchrones :
  - `register(credentials)` : Inscription utilisateur
  - `login(credentials)` : Connexion
  - `logout()` : Déconnexion avec nettoyage des tokens
  - `fetchCurrentUser()` : Récupération du profil
  - `initialize()` : Restauration de session au chargement
- Persistance dans `localStorage` (accessToken, refreshToken)

**Client HTTP Axios (`src/api/client.ts`)**
- Configuration :
  - baseURL : `http://localhost:3001` (auth-service)
  - timeout : 10s
  - Headers : `Content-Type: application/json`
- Intercepteur request :
  - Injection automatique du token JWT dans header `Authorization: Bearer {token}`
- Intercepteur response :
  - Détection des erreurs 401 (Unauthorized)
  - Refresh automatique des tokens expirés via `/auth/refresh`
  - Retry de la requête originale avec nouveau token
  - Déconnexion automatique si refresh échoue

**Vues (Pages)**
- **LoginView** (`/login`) :
  - Formulaire : email + password
  - Validation HTML5 (required, type="email")
  - Affichage des erreurs backend
  - Redirection vers `/dashboard` après succès
  - Lien vers inscription
- **RegisterView** (`/register`) :
  - Formulaire : name + email + password + confirmPassword
  - Validation client : mots de passe identiques, min 8 caractères
  - Message de succès + redirection automatique
  - Lien vers connexion
- **DashboardView** (`/dashboard`) :
  - Tableau de bord protégé (🔒 JWT requis)
  - Affichage des infos utilisateur (nom, email, role)
  - Cartes statistiques (profil, email vérifié, session active)
  - Bouton déconnexion
  - Message de bienvenue

**Routing (`src/router/index.ts`)**
- Routes configurées :
  - `/` → Redirect vers `/dashboard`
  - `/login` (meta: `requiresGuest`) → Accessible uniquement si NON connecté
  - `/register` (meta: `requiresGuest`) → Idem
  - `/dashboard` (meta: `requiresAuth`) → Accessible uniquement si connecté
- Navigation guard global (`router.beforeEach`) :
  - Vérification de `isAuthenticated`
  - Initialisation du store si token présent mais user absent
  - Redirection `/login` si route protégée sans auth
  - Redirection `/dashboard` si déjà connecté et route invité
  - Préservation de l'URL de destination dans query param `?redirect=`

**Configuration**
- `tsconfig.app.json` : Path aliases (`@/*` → `./src/*`, `@webudget/shared-types`)
- `vite.config.ts` : Résolution des alias, port 5173
- `tailwind.config.js` : Scan des fichiers `.vue` pour purge CSS
- `postcss.config.js` : TailwindCSS + Autoprefixer

**Styles**
- Reset CSS global (margin, padding, box-sizing)
- Font stack système : -apple-system, Segoe UI, Roboto, etc.
- Tailwind utility classes pour tous les composants
- Responsive design (sm, md, lg breakpoints)
- Palette de couleurs :
  - Bleu (primary) : bg-blue-600, hover:bg-blue-700
  - Vert (success) : bg-green-50, text-green-600
  - Rouge (error) : bg-red-50, text-red-800
  - Gris (neutral) : bg-gray-50, bg-gray-100

**Intégration Backend**
- Communication avec auth-service (port 3001)
- Utilisation de tous les endpoints REST :
  - POST `/auth/register`
  - POST `/auth/login`
  - POST `/auth/refresh`
  - POST `/auth/logout`
  - GET `/auth/me`
- Gestion des erreurs réseau et 4xx/5xx
- Affichage user-friendly des messages d'erreur

### 🔧 Modifié (Changed)
- `pnpm-workspace.yaml` : Ajout du frontend au workspace (`- 'frontend'`)
- Lockfile pnpm mis à jour avec 74 nouveaux packages (Vue, Vite, Tailwind, etc.)

---

## [0.2.0] - 2025-12-17

### ✨ Ajouté (Added)

#### ÉTAPE 1C : Docker + Auth Service Backend

**Infrastructure Docker**
- `docker-compose.yml` avec 2 services :
  - **PostgreSQL 16 Alpine** (port 5432)
    - Base de données `webudget_db`
    - Volume persistant `postgres_data`
    - Health check automatique
  - **Adminer** (port 8080) - Interface web de gestion de la base de données

**Auth Service (NestJS)**
- Service d'authentification REST sur port 3001
- Modules NestJS :
  - `AppModule` : Module racine avec ConfigModule
  - `PrismaModule` : Module global Prisma avec lifecycle hooks
  - `AuthModule` : Module d'authentification (JWT + Passport)

**Prisma ORM**
- Schéma PostgreSQL (`prisma/schema.prisma`) :
  - **User** : id, email (unique), password (bcrypt), name, avatar, role (enum), emailVerified, timestamps
  - **RefreshToken** : id, token (unique), userId (FK cascade), expiresAt, createdAt
  - **UserRole** enum : USER, ADMIN, PREMIUM
- Migration initiale : `20251217151715_init`
- Scripts npm : `prisma:generate`, `prisma:migrate`, `prisma:studio`

**Authentification JWT**
- Implémentation Passport + JWT Strategy
- 2 types de tokens :
  - **Access Token** : 15min (actions courtes)
  - **Refresh Token** : 7 jours (renouvellement)
- Rotation automatique des refresh tokens (anciens tokens supprimés)
- JWT ID (jti) unique avec timestamp pour éviter les duplications
- Hash bcrypt des mots de passe (10 rounds)

**API REST (5 endpoints)**
- `POST /auth/register` : Créer un compte utilisateur
  - Body : `{ email, password, name }`
  - Response : `{ user, accessToken, refreshToken }`
- `POST /auth/login` : Se connecter
  - Body : `{ email, password }`
  - Response : `{ user, accessToken, refreshToken }`
- `POST /auth/refresh` : Renouveler les tokens
  - Body : `{ refreshToken }`
  - Response : `{ accessToken, refreshToken }` (nouveaux)
- `POST /auth/logout` : Se déconnecter (🔒 JWT requis)
  - Supprime tous les refresh tokens de l'utilisateur
- `GET /auth/me` : Récupérer les infos du user connecté (🔒 JWT requis)

**Validation DTOs**
- `RegisterDto` : Email valide, mot de passe min 8 caractères, nom requis
- `LoginDto` : Email et mot de passe requis
- Validation automatique via `class-validator` et `ValidationPipe`
- Messages d'erreur personnalisés en français

**Tests E2E**
- 13 tests couvrant tous les endpoints (100% de succès)
- Test suite avec Jest + Supertest
- Tests des scénarios :
  - Création d'utilisateur et rejet de doublons
  - Validation des champs requis (400 Bad Request)
  - Login avec credentials valides/invalides
  - Accès protégé avec/sans token JWT
  - Renouvellement de tokens avec rotation
  - Déconnexion et nettoyage des tokens

**Configuration**
- Variables d'environnement (.env) :
  - DATABASE_URL (PostgreSQL)
  - JWT_ACCESS_SECRET / JWT_REFRESH_SECRET
  - JWT_ACCESS_EXPIRATION / JWT_REFRESH_EXPIRATION
  - CORS_ORIGIN (http://localhost:5173)
  - PORT (3001)
- TypeScript config adapté à NestJS :
  - `module: "commonjs"`
  - `moduleResolution: "node"`
  - Decorators experimentaux activés
  - Path alias : `@webudget/shared-types` → `../../packages/shared-types/dist`

### 🐛 Corrigé (Fixed)
- TypeScript `moduleResolution: "bundler"` incompatible avec CommonJS → changé en "node"
- Build output dans mauvais répertoire (rootDir auto-détecté) → supprimé rootDir
- Import shared-types en conflit avec rootDir → utilisation de dist/ au lieu de src/
- Refresh tokens JWT identiques (déterministes) → ajout de jti (JWT ID) unique avec timestamp
- Validation DTO retournant 500 au lieu de 400 → création de DTOs locaux avec class-validator

### 💥 Breaking Changes
- **Nécessite Docker** pour PostgreSQL (Docker Compose requis)
- Changement d'architecture : passage de SQLite (prévu) à PostgreSQL en Docker

---

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
