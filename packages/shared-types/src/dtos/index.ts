// 🎯 DTOs (Data Transfer Objects) : Objets envoyés/reçus par les API

import { AccountType, Currency, TransactionCategory, TransactionType, ParticipantStatus, RecurrenceFrequency, SettlementStatus, MessageType } from '../enums';

// ========== AUTHENTIFICATION ==========

/**
 * Données pour créer un compte
 */
export interface RegisterDto {
  email: string;
  password: string;     // Min 8 caractères
  name: string;
}

/**
 * Données pour se connecter
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Mise à jour du profil
 */
export interface UpdateProfileDto {
  name?: string;
  avatar?: string;
}

// ========== COMPTES FINANCIERS ==========

/**
 * Créer un compte
 */
export interface CreateAccountDto {
  name: string;
  type: AccountType;
  currency: Currency;
}

/**
 * Mettre à jour un compte
 */
export interface UpdateAccountDto {
  name?: string;
  currency?: Currency;
}

/**
 * Ajouter un membre à un compte partagé
 */
export interface AddAccountMemberDto {
  userId: number;       // ID de l'utilisateur à ajouter
}

// ========== TRANSACTIONS ==========

/**
 * Créer une transaction
 */
export interface CreateTransactionDto {
  accountId: number;
  amount: number;
  currency: Currency;
  category: TransactionCategory;
  type: TransactionType;
  description?: string;
  date?: Date;          // Par défaut = aujourd'hui
}

/**
 * Mettre à jour une transaction
 */
export interface UpdateTransactionDto {
  amount?: number;
  category?: TransactionCategory;
  description?: string;
  date?: Date;
}

/**
 * Filtres pour rechercher des transactions
 */
export interface TransactionFilterDto {
  accountId?: number;
  startDate?: Date;     // Transactions après cette date
  endDate?: Date;       // Transactions avant cette date
  minAmount?: number;
  maxAmount?: number;
  category?: TransactionCategory;
  type?: TransactionType;
}

// ========== TRANSACTIONS RÉCURRENTES ==========

/**
 * Créer une transaction récurrente
 */
export interface CreateRecurringTransactionDto {
  accountId: number;
  amount: number;
  currency: Currency;
  category: TransactionCategory;
  type: TransactionType;
  description?: string;
  frequency: RecurrenceFrequency;
  startDate: Date;
  endDate?: Date;       // Optionnel = pas de fin
}

// ========== ÉVÉNEMENTS ==========

/**
 * Créer un événement
 */
export interface CreateEventDto {
  title: string;
  description?: string;
  date: Date;
  location?: string;
  participantIds: number[];  // IDs des participants à inviter
}

/**
 * Mettre à jour un événement
 */
export interface UpdateEventDto {
  title?: string;
  description?: string;
  date?: Date;
  location?: string;
}

/**
 * Répondre à une invitation
 */
export interface RespondToEventDto {
  status: ParticipantStatus;  // ACCEPTED ou DECLINED
}

// ========== DÉPENSES PARTAGÉES ==========

/**
 * Créer une dépense partagée lors d'un événement
 */
export interface CreateEventExpenseDto {
  eventId: number;
  amount: number;
  currency: Currency;
  description?: string;
  splitBetween: number[];    // IDs des participants qui partagent
}

// ========== REMBOURSEMENTS ==========

/**
 * Marquer un remboursement comme payé
 */
export interface MarkSettlementPaidDto {
  settlementId: number;
}

// ========== MESSAGES ==========

/**
 * Envoyer un message
 */
export interface SendMessageDto {
  groupId: number;
  content: string;
  type?: MessageType;        // Par défaut = TEXT
  attachments?: string[];    // URLs des fichiers
}

/**
 * Marquer des messages comme lus
 */
export interface MarkMessagesReadDto {
  messageIds: number[];
}

// ========== PAGINATION ==========

/**
 * Paramètres de pagination pour les listes
 */
export interface PaginationDto {
  page?: number;             // Numéro de page (défaut = 1)
  limit?: number;            // Éléments par page (défaut = 20)
  sortBy?: string;           // Champ pour trier (ex: "createdAt")
  sortOrder?: 'asc' | 'desc'; // Ordre de tri
}

/**
 * Réponse paginée générique
 * Exemple : PaginatedResponse<User> = liste d'utilisateurs paginée
 */
export interface PaginatedResponse<T> {
  data: T[];                 // Les données
  total: number;             // Nombre total d'éléments
  page: number;              // Page actuelle
  limit: number;             // Éléments par page
  totalPages: number;        // Nombre total de pages
}
