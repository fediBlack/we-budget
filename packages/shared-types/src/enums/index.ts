// 🎯 ENUMS : Valeurs constantes utilisées partout dans l'application

/**
 * Rôles utilisateur - Définit les permissions
 * USER = utilisateur normal
 * PREMIUM = utilisateur payant (fonctionnalités avancées)
 * ADMIN = administrateur (accès total)
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  PREMIUM = 'PREMIUM',
}

/**
 * Types de compte
 * PERSONAL = compte personnel (1 seul propriétaire)
 * SHARED = compte partagé (plusieurs utilisateurs)
 */
export enum AccountType {
  PERSONAL = 'PERSONAL',
  SHARED = 'SHARED',
}

/**
 * Devises supportées - 9 monnaies majeures
 */
export enum Currency {
  EUR = 'EUR', // Euro
  USD = 'USD', // Dollar américain
  GBP = 'GBP', // Livre sterling
  CAD = 'CAD', // Dollar canadien
  AUD = 'AUD', // Dollar australien
  JPY = 'JPY', // Yen japonais
  CHF = 'CHF', // Franc suisse
  INR = 'INR', // Roupie indienne
  SGD = 'SGD', // Dollar singapourien
}

/**
 * Catégories de transactions - Pour classifier les dépenses/revenus
 */
export enum TransactionCategory {
  FOOD = 'FOOD',               // Alimentation
  TRANSPORT = 'TRANSPORT',     // Transports
  HOUSING = 'HOUSING',         // Logement
  ENTERTAINMENT = 'ENTERTAINMENT', // Divertissement
  HEALTH = 'HEALTH',           // Santé
  SHOPPING = 'SHOPPING',       // Achats
  UTILITIES = 'UTILITIES',     // Factures (eau, électricité, etc.)
  OTHER = 'OTHER',             // Autre
}

/**
 * Types de transaction
 * INCOME = argent qui rentre
 * EXPENSE = argent qui sort
 * TRANSFER = transfert entre comptes
 */
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

/**
 * Statut de participation à un événement
 */
export enum ParticipantStatus {
  INVITED = 'INVITED',     // Invité (pas encore répondu)
  ACCEPTED = 'ACCEPTED',   // A accepté
  DECLINED = 'DECLINED',   // A refusé
}

/**
 * Statut de remboursement
 */
export enum SettlementStatus {
  PENDING = 'PENDING',     // En attente
  PAID = 'PAID',           // Payé
  CANCELLED = 'CANCELLED', // Annulé
}

/**
 * Types de message dans le chat
 */
export enum MessageType {
  TEXT = 'TEXT',       // Message texte
  IMAGE = 'IMAGE',     // Image
  FILE = 'FILE',       // Fichier
  SYSTEM = 'SYSTEM',   // Message système (ex: "X a rejoint le groupe")
}

/**
 * Types de groupe de chat
 */
export enum ChatGroupType {
  DIRECT = 'DIRECT',           // Conversation 1-to-1
  GROUP = 'GROUP',             // Groupe libre
  EVENT_LINKED = 'EVENT_LINKED', // Lié à un événement
}

/**
 * Types de notification
 */
export enum NotificationType {
  EVENT_INVITATION = 'EVENT_INVITATION',       // Invitation à un événement
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',       // Rappel de paiement
  SETTLEMENT_REQUEST = 'SETTLEMENT_REQUEST',   // Demande de remboursement
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',       // Nouveau message
  ACCOUNT_INVITATION = 'ACCOUNT_INVITATION',   // Invitation à rejoindre un compte
}

/**
 * Fréquence de récurrence pour les transactions répétitives
 */
export enum RecurrenceFrequency {
  DAILY = 'DAILY',       // Tous les jours
  WEEKLY = 'WEEKLY',     // Toutes les semaines
  MONTHLY = 'MONTHLY',   // Tous les mois
  YEARLY = 'YEARLY',     // Tous les ans
}
