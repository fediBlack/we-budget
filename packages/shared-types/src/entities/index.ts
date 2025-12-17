// 🎯 ENTITIES : Modèles de données (ce qui est stocké en base de données)

import { UserRole, AccountType, Currency, TransactionCategory, TransactionType, ParticipantStatus, SettlementStatus, MessageType, ChatGroupType, NotificationType, RecurrenceFrequency } from '../enums';

/**
 * Utilisateur de l'application
 */
export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string | null;        // Photo de profil (optionnel)
  role: UserRole;
  emailVerified: boolean;        // Email confirmé ?
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Compte financier (personnel ou partagé)
 */
export interface Account {
  id: number;
  name: string;                  // Ex: "Compte courant", "Budget vacances"
  type: AccountType;
  balance: number;               // Solde actuel
  currency: Currency;
  ownerId: number;               // Créateur du compte
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Membre d'un compte partagé
 */
export interface AccountMember {
  id: number;
  accountId: number;
  userId: number;
  role: 'OWNER' | 'MEMBER';      // OWNER = créateur, MEMBER = invité
  joinedAt: Date;
}

/**
 * Transaction financière (dépense, revenu, transfert)
 */
export interface Transaction {
  id: number;
  accountId: number;
  amount: number;
  currency: Currency;
  category: TransactionCategory;
  type: TransactionType;
  description?: string | null;
  date: Date;                    // Date de la transaction
  createdById: number;           // Qui a créé cette transaction
  recurring: boolean;            // Est-ce une transaction récurrente ?
  recurrenceId?: number | null;  // Lien vers la récurrence si applicable
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Template de transaction récurrente
 * Ex: "Loyer de 800€ tous les 1er du mois"
 */
export interface RecurringTransaction {
  id: number;
  accountId: number;
  amount: number;
  currency: Currency;
  category: TransactionCategory;
  type: TransactionType;
  description?: string | null;
  frequency: RecurrenceFrequency;
  startDate: Date;               // Date de début
  endDate?: Date | null;         // Date de fin (optionnel)
  lastExecuted?: Date | null;    // Dernière exécution
  active: boolean;               // Actif ou pausé
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Événement (sortie, voyage, etc.)
 */
export interface Event {
  id: number;
  title: string;
  description?: string | null;
  date: Date;
  location?: string | null;
  createdById: number;
  chatGroupId?: number | null;   // Groupe de chat lié
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Participant à un événement
 */
export interface EventParticipant {
  id: number;
  eventId: number;
  userId: number;
  status: ParticipantStatus;
  invitedAt: Date;
  respondedAt?: Date | null;
}

/**
 * Dépense partagée lors d'un événement
 * Ex: "Restaurant 120€ payé par Alice, partagé entre Alice, Bob, Charlie"
 */
export interface EventExpense {
  id: number;
  eventId: number;
  amount: number;
  currency: Currency;
  description?: string | null;
  paidById: number;              // Qui a payé ?
  splitBetween: number[];        // IDs des participants qui partagent
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Remboursement entre participants
 * Ex: "Bob doit 40€ à Alice"
 */
export interface Settlement {
  id: number;
  expenseId: number;
  fromUserId: number;            // Qui doit rembourser
  toUserId: number;              // À qui rembourser
  amount: number;
  currency: Currency;
  status: SettlementStatus;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Groupe de chat (1-to-1, groupe, ou lié à un événement)
 */
export interface ChatGroup {
  id: number;
  name?: string | null;          // Nom du groupe (optionnel pour 1-to-1)
  type: ChatGroupType;
  eventId?: number | null;       // Lien vers un événement si applicable
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Membre d'un groupe de chat
 */
export interface ChatMember {
  id: number;
  groupId: number;
  userId: number;
  joinedAt: Date;
}

/**
 * Message dans un chat
 */
export interface Message {
  id: number;
  groupId: number;
  senderId: number;
  content: string;
  type: MessageType;
  attachments?: string[] | null; // URLs des fichiers joints
  readBy: number[];              // IDs des utilisateurs qui ont lu
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification utilisateur
 */
export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any> | null; // Données supplémentaires (JSON)
  read: boolean;
  createdAt: Date;
}
