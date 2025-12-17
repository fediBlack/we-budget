# 🎯 Stratégie Git & Versioning

## 📌 Conventions de Commit

### Format : Conventional Commits

```
<type>(<scope>): <description>

[body optionnel]

[footer optionnel]
```

### Types de commits

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat(auth): add JWT authentication` |
| `fix` | Correction de bug | `fix(transaction): correct amount calculation` |
| `docs` | Documentation | `docs: update README with setup instructions` |
| `style` | Formatage (sans impact code) | `style: format files with prettier` |
| `refactor` | Refactoring | `refactor(api): simplify controller logic` |
| `test` | Ajout/modification tests | `test(auth): add login endpoint tests` |
| `chore` | Maintenance | `chore: update dependencies` |
| `perf` | Performance | `perf(db): add index on user email` |
| `ci` | CI/CD | `ci: add GitHub Actions workflow` |

### Breaking Changes

Si le commit introduit un **breaking change** :

```
feat(api): change login endpoint response format

BREAKING CHANGE: Login endpoint now returns { user, token } instead of { accessToken }
```

---

## 🏷️ Stratégie de Tags

### Tags par ÉTAPE

Chaque étape majeure du projet reçoit un tag :

```bash
git tag -a v0.1.0 -m "ÉTAPE 1A + 1B: Monorepo + shared-types"
git tag -a v0.2.0 -m "ÉTAPE 1C: Auth service + PostgreSQL"
git tag -a v0.3.0 -m "ÉTAPE 1D: Frontend auth UI"
git tag -a v0.4.0 -m "ÉTAPE 1E: CI/CD"
```

### Voir les tags

```bash
git tag                    # Liste tous les tags
git show v0.1.0           # Voir les détails d'un tag
git log --oneline --decorate  # Historique avec tags
```

### Revenir à une version

```bash
git checkout v0.1.0       # Voir le code à la version 0.1.0
git checkout main         # Retourner à la dernière version
```

---

## 📦 Semantic Versioning

### Format : MAJOR.MINOR.PATCH

```
v1.2.3
 │ │ └─ PATCH : Bug fixes (0.1.0 → 0.1.1)
 │ └─── MINOR : Nouvelles fonctionnalités (0.1.0 → 0.2.0)
 └───── MAJOR : Breaking changes (0.9.0 → 1.0.0)
```

### Exemples

| Changement | Avant | Après | Raison |
|------------|-------|-------|--------|
| Ajout auth service | v0.1.0 | v0.2.0 | Nouvelle fonctionnalité |
| Fix bug login | v0.2.0 | v0.2.1 | Correction de bug |
| Changer API response | v0.2.1 | v1.0.0 | Breaking change |

---

## 🔄 Workflow Git

### Pour chaque ÉTAPE

```bash
# 1. Vérifier l'état
git status

# 2. Ajouter les fichiers modifiés
git add .

# 3. Commiter avec message conventionnel
git commit -m "feat: ÉTAPE 1C - Auth service avec PostgreSQL

- Docker Compose avec PostgreSQL 16
- NestJS auth-service (port 3001)
- Prisma schema avec User, RefreshToken
- JWT authentication (access + refresh tokens)
- Tests avec 85% de couverture"

# 4. Créer un tag
git tag -a v0.2.0 -m "Version 0.2.0 - Auth service"

# 5. Vérifier l'historique
git log --oneline --decorate
```

### Annuler des modifications (si besoin)

```bash
# Annuler les modifications non commitées
git restore <fichier>

# Annuler le dernier commit (garder les modifications)
git reset --soft HEAD~1

# Annuler le dernier commit (supprimer les modifications)
git reset --hard HEAD~1
```

---

## 🌿 Branches (Pour plus tard)

Pour le moment, on travaille sur `main` directement.

Quand le projet sera en production :

```bash
# Créer une branche pour une fonctionnalité
git checkout -b feat/recurring-transactions

# Faire les modifications + commit
git commit -m "feat: add recurring transactions"

# Fusionner dans main
git checkout main
git merge feat/recurring-transactions
```

---

## 📊 Changesets (Pour plus tard)

Changesets gère automatiquement :
- Les versions de packages
- Le CHANGELOG.md
- Les publications npm

Commande :
```bash
pnpm changeset         # Déclarer un changement
pnpm changeset version # Mettre à jour les versions
pnpm changeset publish # Publier sur npm
```

On configurera ça dans l'ÉTAPE 1E !

---

## ✅ Checklist pour chaque ÉTAPE

- [ ] Développer la fonctionnalité
- [ ] Écrire les tests (80%+ couverture)
- [ ] Mettre à jour le CHANGELOG.md
- [ ] `git add .`
- [ ] `git commit -m "feat: ÉTAPE X - Description"`
- [ ] `git tag -a vX.Y.Z -m "Version X.Y.Z - Description"`
- [ ] `git log --oneline` pour vérifier
