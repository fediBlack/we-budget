#!/bin/bash
set -e

# 🗄️ Script d'initialisation PostgreSQL
# Crée toutes les bases de données pour les différents services

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- 🏦 Base de données pour le financial-service
    CREATE DATABASE webudget_financial;
    GRANT ALL PRIVILEGES ON DATABASE webudget_financial TO webudget;

    -- 🎉 Base de données pour le event-service (future)
    CREATE DATABASE webudget_events;
    GRANT ALL PRIVILEGES ON DATABASE webudget_events TO webudget;

    -- 💬 Base de données pour le chat-service (future)
    CREATE DATABASE webudget_chat;
    GRANT ALL PRIVILEGES ON DATABASE webudget_chat TO webudget;
EOSQL

echo "✅ Toutes les bases de données ont été créées avec succès"
