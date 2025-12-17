/**
 * Tests des ENTITIES
 * But : Vérifier que les interfaces TypeScript sont bien définies
 * Note : TypeScript vérifie les types à la compilation, pas à l'exécution
 */

import {
  User,
  Account,
  AccountMember,
  Transaction,
  RecurringTransaction,
  Event,
  EventParticipant,
  EventExpense,
  Settlement,
  ChatGroup,
  ChatMember,
  Message,
  Notification,
  UserRole,
  AccountType,
  Currency,
  TransactionCategory,
  TransactionType,
  ParticipantStatus,
  SettlementStatus,
  MessageType,
  ChatGroupType,
  NotificationType,
  RecurrenceFrequency,
} from '../src';

describe('Entities', () => {
  describe('User', () => {
    it('devrait accepter un utilisateur valide', () => {
      const user: User = {
        id: 1,
        email: 'alice@example.com',
        name: 'Alice',
        avatar: null,
        role: UserRole.USER,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.email).toBe('alice@example.com');
      expect(user.role).toBe(UserRole.USER);
    });
  });

  describe('Account', () => {
    it('devrait accepter un compte personnel valide', () => {
      const account: Account = {
        id: 1,
        name: 'Compte courant',
        type: AccountType.PERSONAL,
        balance: 1500.50,
        currency: Currency.EUR,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(account.type).toBe(AccountType.PERSONAL);
      expect(account.currency).toBe(Currency.EUR);
      expect(account.balance).toBe(1500.50);
    });
  });

  describe('Transaction', () => {
    it('devrait accepter une transaction valide', () => {
      const transaction: Transaction = {
        id: 1,
        accountId: 1,
        amount: 50.00,
        currency: Currency.EUR,
        category: TransactionCategory.FOOD,
        type: TransactionType.EXPENSE,
        description: 'Restaurant',
        date: new Date(),
        createdById: 1,
        recurring: false,
        recurrenceId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(transaction.type).toBe(TransactionType.EXPENSE);
      expect(transaction.category).toBe(TransactionCategory.FOOD);
    });
  });

  describe('RecurringTransaction', () => {
    it('devrait accepter une transaction récurrente valide', () => {
      const recurring: RecurringTransaction = {
        id: 1,
        accountId: 1,
        amount: 800,
        currency: Currency.EUR,
        category: TransactionCategory.HOUSING,
        type: TransactionType.EXPENSE,
        description: 'Loyer',
        frequency: RecurrenceFrequency.MONTHLY,
        startDate: new Date('2025-01-01'),
        endDate: null,
        lastExecuted: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(recurring.frequency).toBe(RecurrenceFrequency.MONTHLY);
      expect(recurring.active).toBe(true);
    });
  });

  describe('Event', () => {
    it('devrait accepter un événement valide', () => {
      const event: Event = {
        id: 1,
        title: 'Weekend à Paris',
        description: 'Sortie entre amis',
        date: new Date('2025-06-15'),
        location: 'Paris, France',
        createdById: 1,
        chatGroupId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(event.title).toBe('Weekend à Paris');
      expect(event.location).toBe('Paris, France');
    });
  });

  describe('EventParticipant', () => {
    it('devrait accepter un participant valide', () => {
      const participant: EventParticipant = {
        id: 1,
        eventId: 1,
        userId: 2,
        status: ParticipantStatus.ACCEPTED,
        invitedAt: new Date(),
        respondedAt: new Date(),
      };

      expect(participant.status).toBe(ParticipantStatus.ACCEPTED);
    });
  });

  describe('EventExpense', () => {
    it('devrait accepter une dépense partagée valide', () => {
      const expense: EventExpense = {
        id: 1,
        eventId: 1,
        amount: 120,
        currency: Currency.EUR,
        description: 'Restaurant',
        paidById: 1,
        splitBetween: [1, 2, 3],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(expense.amount).toBe(120);
      expect(expense.splitBetween).toHaveLength(3);
    });
  });

  describe('Settlement', () => {
    it('devrait accepter un remboursement valide', () => {
      const settlement: Settlement = {
        id: 1,
        expenseId: 1,
        fromUserId: 2,
        toUserId: 1,
        amount: 40,
        currency: Currency.EUR,
        status: SettlementStatus.PENDING,
        paidAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(settlement.status).toBe(SettlementStatus.PENDING);
      expect(settlement.paidAt).toBeNull();
    });
  });

  describe('ChatGroup', () => {
    it('devrait accepter un groupe de chat valide', () => {
      const group: ChatGroup = {
        id: 1,
        name: 'Weekend Paris',
        type: ChatGroupType.EVENT_LINKED,
        eventId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(group.type).toBe(ChatGroupType.EVENT_LINKED);
      expect(group.eventId).toBe(1);
    });
  });

  describe('Message', () => {
    it('devrait accepter un message valide', () => {
      const message: Message = {
        id: 1,
        groupId: 1,
        senderId: 1,
        content: 'Salut tout le monde!',
        type: MessageType.TEXT,
        attachments: null,
        readBy: [1],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(message.type).toBe(MessageType.TEXT);
      expect(message.readBy).toContain(1);
    });
  });

  describe('Notification', () => {
    it('devrait accepter une notification valide', () => {
      const notification: Notification = {
        id: 1,
        userId: 1,
        type: NotificationType.EVENT_INVITATION,
        title: 'Nouvelle invitation',
        message: 'Alice vous invite à Weekend Paris',
        data: { eventId: 1 },
        read: false,
        createdAt: new Date(),
      };

      expect(notification.type).toBe(NotificationType.EVENT_INVITATION);
      expect(notification.read).toBe(false);
    });
  });
});
