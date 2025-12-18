# 🚀 Guide de Déploiement WeBudget

Ce guide détaille les différentes méthodes de déploiement de WeBudget.

## 📋 Prérequis

### Local Development
- Node.js 20+
- pnpm 10.25.0+
- PostgreSQL 16
- Docker (optionnel)

### Production
- Serveur Linux (Ubuntu 22.04 LTS recommandé)
- Docker & Docker Compose
- Nom de domaine configuré
- Certificat SSL (Let's Encrypt recommandé)

## 🏠 Déploiement Local

### 1. Avec Docker Compose (Recommandé)

```bash
# Cloner le repository
git clone https://github.com/fediBlack/we-budget.git
cd webudget

# Créer le fichier .env
cp .env.example .env

# Éditer .env avec vos valeurs
nano .env

# Démarrer tous les services
docker-compose up -d

# Vérifier que tous les services sont UP
docker-compose ps

# Voir les logs
docker-compose logs -f
```

**URLs disponibles :**
- Frontend : http://localhost:5173
- Auth API : http://localhost:3001
- Financial API : http://localhost:3002
- Events API : http://localhost:3003
- Chat API : http://localhost:3004
- Adminer (DB UI) : http://localhost:8080

### 2. Sans Docker (Mode Développement)

```bash
# Installer les dépendances
pnpm install

# Démarrer PostgreSQL (option 1 : Docker uniquement pour PostgreSQL)
docker-compose up -d postgres

# Ou option 2 : PostgreSQL local
# Créer les 4 bases de données manuellement

# Générer les clients Prisma pour chaque service
cd backend/auth-service && pnpm prisma generate
cd ../financial-service && pnpm prisma generate
cd ../events-service && pnpm prisma generate
cd ../chat-service && pnpm prisma generate

# Appliquer les migrations
cd backend/auth-service && pnpm prisma migrate deploy
cd ../financial-service && pnpm prisma migrate deploy
cd ../events-service && pnpm prisma migrate deploy
cd ../chat-service && pnpm prisma migrate deploy

# Démarrer tous les services (dans des terminaux séparés)
cd backend/auth-service && pnpm dev
cd backend/financial-service && pnpm dev
cd backend/events-service && pnpm dev
cd backend/chat-service && pnpm dev
cd frontend && pnpm dev
```

## 🌐 Déploiement Production

### Option 1 : VPS avec Docker Compose

**Étape 1 : Préparer le serveur**

```bash
# Connexion SSH
ssh user@your-server.com

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker --version
docker-compose --version
```

**Étape 2 : Cloner et configurer**

```bash
# Cloner le repository
git clone https://github.com/fediBlack/we-budget.git
cd webudget

# Créer le fichier .env production
nano .env
```

**Contenu .env production :**

```env
# JWT Secrets (GÉNÉRER DE NOUVEAUX SECRETS !)
JWT_ACCESS_SECRET=GENERATED_SECRET_HERE_USE_OPENSSL_RAND
JWT_REFRESH_SECRET=GENERATED_SECRET_HERE_USE_OPENSSL_RAND

# PostgreSQL
POSTGRES_USER=webudget
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE

# Node Environment
NODE_ENV=production

# CORS (votre domaine)
CORS_ORIGIN=https://webudget.example.com
```

**Générer des secrets sécurisés :**

```bash
# Générer JWT secrets
openssl rand -base64 64
openssl rand -base64 64
```

**Étape 3 : Configurer Nginx**

```bash
# Mettre à jour nginx.conf avec votre domaine
nano docker/nginx/nginx.conf
```

**Étape 4 : Lancer l'application**

```bash
# Build et démarrer
docker-compose up -d --build

# Vérifier les logs
docker-compose logs -f

# Vérifier que tous les services sont UP
docker-compose ps
```

**Étape 5 : Configurer SSL avec Let's Encrypt**

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat
sudo certbot --nginx -d webudget.example.com

# Auto-renouvellement
sudo certbot renew --dry-run
```

### Option 2 : Kubernetes (Avancé)

```bash
# TODO : Ajouter les manifests Kubernetes
# - Deployments
# - Services
# - ConfigMaps
# - Secrets
# - Ingress
# - PersistentVolumeClaims
```

## 🔧 Configuration Avancée

### Reverse Proxy Nginx (Production)

Créer `/etc/nginx/sites-available/webudget` :

```nginx
server {
    listen 80;
    server_name webudget.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name webudget.example.com;

    ssl_certificate /etc/letsencrypt/live/webudget.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/webudget.example.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Gateway
    location /api/auth/ {
        proxy_pass http://localhost:3001/;
        include proxy_params;
    }

    location /api/financial/ {
        proxy_pass http://localhost:3002/;
        include proxy_params;
    }

    location /api/events/ {
        proxy_pass http://localhost:3003/;
        include proxy_params;
    }

    location /api/chat/ {
        proxy_pass http://localhost:3004/chat/;
        include proxy_params;
    }

    # WebSocket pour Chat
    location /socket.io/ {
        proxy_pass http://localhost:3004/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/webudget /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Variables d'environnement par service

**auth-service/.env :**
```env
DATABASE_URL=postgresql://webudget:password@postgres:5432/webudget_auth?schema=public
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-secret
PORT=3001
NODE_ENV=production
```

**financial-service/.env :**
```env
DATABASE_URL=postgresql://webudget:password@postgres:5432/webudget_financial?schema=public
JWT_ACCESS_SECRET=your-secret
PORT=3002
NODE_ENV=production
```

**events-service/.env :**
```env
DATABASE_URL=postgresql://webudget:password@postgres:5432/webudget_events?schema=public
JWT_ACCESS_SECRET=your-secret
PORT=3003
NODE_ENV=production
```

**chat-service/.env :**
```env
DATABASE_URL=postgresql://webudget:password@postgres:5432/webudget_chat?schema=public
JWT_ACCESS_SECRET=your-secret
PORT=3004
NODE_ENV=production
```

## 📊 Monitoring et Logs

### Docker Logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f auth-service

# Dernières 100 lignes
docker-compose logs --tail=100 financial-service
```

### Health Checks

```bash
# Vérifier tous les services
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

### Métriques (À implémenter)

```bash
# TODO : Installer Prometheus et Grafana
docker-compose -f docker-compose.monitoring.yml up -d
```

## 🔄 Mise à jour

```bash
# Arrêter les services
docker-compose down

# Récupérer les dernières modifications
git pull

# Rebuild et redémarrer
docker-compose up -d --build

# Vérifier les logs
docker-compose logs -f
```

## 💾 Sauvegarde et Restauration

### Sauvegarde PostgreSQL

```bash
# Sauvegarde manuelle
docker exec webudget-postgres pg_dumpall -U webudget > backup_$(date +%Y%m%d_%H%M%S).sql

# Sauvegarde automatique (cron)
# Ajouter à crontab -e :
# 0 2 * * * docker exec webudget-postgres pg_dumpall -U webudget > /backups/webudget_$(date +\%Y\%m\%d).sql
```

### Restauration

```bash
# Restaurer depuis un backup
docker exec -i webudget-postgres psql -U webudget < backup_20231215_020000.sql
```

## 🚨 Dépannage

### Services ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier l'état
docker-compose ps

# Reconstruire un service
docker-compose up -d --build auth-service
```

### Base de données inaccessible

```bash
# Vérifier PostgreSQL
docker exec -it webudget-postgres psql -U webudget -c "SELECT version();"

# Lister les bases de données
docker exec -it webudget-postgres psql -U webudget -c "\l"
```

### Problèmes de permissions

```bash
# Donner les permissions au volume
sudo chown -R 999:999 postgres_data
```

## 📞 Support

En cas de problème :

1. Vérifier les logs : `docker-compose logs -f`
2. Vérifier la configuration : `.env` et `docker-compose.yml`
3. Vérifier les ports : `sudo netstat -tulpn | grep :300`
4. Ouvrir une issue sur GitHub

## ✅ Checklist de Déploiement

- [ ] Serveur configuré avec Docker et Docker Compose
- [ ] Repository cloné
- [ ] Fichier `.env` créé avec des secrets sécurisés
- [ ] Domaine configuré et pointant vers le serveur
- [ ] Services démarrés avec `docker-compose up -d`
- [ ] Certificat SSL installé
- [ ] Nginx configuré comme reverse proxy
- [ ] Sauvegarde automatique configurée
- [ ] Monitoring mis en place
- [ ] Tests de santé passants

---

**Bon déploiement ! 🚀**
