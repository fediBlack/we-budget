/**
 * Tests des DTOs
 * But : Vérifier que les DTOs sont bien typés
 */

import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  CreateAccountDto,
  UpdateAccountDto,
  AddAccountMemberDto,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilterDto,
  CreateRecurringTransactionDto,
  CreateEventDto,
  UpdateEventDto,
  RespondToEventDto,
  CreateEventExpenseDto,
  MarkSettlementPaidDto,
  SendMessageDto,
  MarkMessagesReadDto,
  PaginationDto,
  PaginatedResponse,
  AccountType,
  Currency,
  TransactionCategory,
  TransactionType,
  ParticipantStatus,
  RecurrenceFrequency,
  MessageType,
} from '../src';

describe('DTOs', () => {
  describe('Auth DTOs', () => {
    it('RegisterDto devrait être valide', () => {
      const dto: RegisterDto = {
        email: 'alice@example.com',
        password: 'SecurePass123!',
        name: 'Alice',
      };

      expect(dto.email).toBe('alice@example.com');
    });

    it('LoginDto devrait être valide', () => {
      const dto: LoginDto = {
        email: 'alice@example.com',
        password: 'SecurePass123!',
      };

      expect(dto.email).toBe('alice@example.com');
    });

    it('UpdateProfileDto devrait accepter des champs optionnels', () => {
      const dto: UpdateProfileDto = {
        name: 'Alice Smith',
      };

      expect(dto.name).toBe('Alice Smith');
      expect(dto.avatar).toBeUndefined();
    });
  });

  describe('Account DTOs', () => {
    it('CreateAccountDto devrait être valide', () => {
      const dto: CreateAccountDto = {
        name: 'Compte courant',
        type: AccountType.PERSONAL,
        currency: Currency.EUR,
      };

      expect(dto.type).toBe(AccountType.PERSONAL);
    });

    it('UpdateAccountDto devrait accepter des champs optionnels', () => {
      const dto: UpdateAccountDto = {
        name: 'Nouveau nom',
      };

      expect(dto.name).toBe('Nouveau nom');
      expect(dto.currency).toBeUndefined();
    });

    it('AddAccountMemberDto devrait être valide', () => {
      const dto: AddAccountMemberDto = {
        userId: 2,
      };

      expect(dto.userId).toBe(2);
    });
  });

  describe('Transaction DTOs', () => {
    it('CreateTransactionDto devrait être valide', () => {
      const dto: CreateTransactionDto = {
        accountId: 1,
        amount: 50,
        currency: Currency.EUR,
        category: TransactionCategory.FOOD,
        type: TransactionType.EXPENSE,
        description: 'Restaurant',
      };

      expect(dto.amount).toBe(50);
      expect(dto.category).toBe(TransactionCategory.FOOD);
    });

    it('TransactionFilterDto devrait accepter des filtres optionnels', () => {
      const dto: TransactionFilterDto = {
        accountId: 1,
        category: TransactionCategory.FOOD,
      };

      expect(dto.accountId).toBe(1);
      expect(dto.startDate).toBeUndefined();
    });
  });

  describe('Recurring Transaction DTOs', () => {
    it('CreateRecurringTransactionDto devrait être valide', () => {
      const dto: CreateRecurringTransactionDto = {
        accountId: 1,
        amount: 800,
        currency: Currency.EUR,
        category: TransactionCategory.HOUSING,
        type: TransactionType.EXPENSE,
        description: 'Loyer',
        frequency: RecurrenceFrequency.MONTHLY,
        startDate: new Date('2025-01-01'),
      };

      expect(dto.frequency).toBe(RecurrenceFrequency.MONTHLY);
      expect(dto.amount).toBe(800);
    });
  });

  describe('Event DTOs', () => {
    it('CreateEventDto devrait être valide', () => {
      const dto: CreateEventDto = {
        title: 'Weekend Paris',
        description: 'Sortie entre amis',
        date: new Date('2025-06-15'),
        location: 'Paris',
        participantIds: [1, 2, 3],
      };

      expect(dto.participantIds).toHaveLength(3);
    });

    it('RespondToEventDto devrait être valide', () => {
      const dto: RespondToEventDto = {
        status: ParticipantStatus.ACCEPTED,
      };

      expect(dto.status).toBe(ParticipantStatus.ACCEPTED);
    });
  });

  describe('Event Expense DTOs', () => {
    it('CreateEventExpenseDto devrait être valide', () => {
      const dto: CreateEventExpenseDto = {
        eventId: 1,
        amount: 120,
        currency: Currency.EUR,
        description: 'Restaurant',
        splitBetween: [1, 2, 3],
      };

      expect(dto.amount).toBe(120);
      expect(dto.splitBetween).toHaveLength(3);
    });

    it('MarkSettlementPaidDto devrait être valide', () => {
      const dto: MarkSettlementPaidDto = {
        settlementId: 1,
      };

      expect(dto.settlementId).toBe(1);
    });
  });

  describe('Message DTOs', () => {
    it('SendMessageDto devrait être valide', () => {
      const dto: SendMessageDto = {
        groupId: 1,
        content: 'Salut!',
        type: MessageType.TEXT,
      };

      expect(dto.content).toBe('Salut!');
      expect(dto.type).toBe(MessageType.TEXT);
    });

    it('MarkMessagesReadDto devrait être valide', () => {
      const dto: MarkMessagesReadDto = {
        messageIds: [1, 2, 3],
      };

      expect(dto.messageIds).toHaveLength(3);
    });
  });

  describe('Pagination DTOs', () => {
    it('PaginationDto devrait accepter des paramètres optionnels', () => {
      const dto: PaginationDto = {
        page: 2,
        limit: 50,
      };

      expect(dto.page).toBe(2);
      expect(dto.sortBy).toBeUndefined();
    });

    it('PaginatedResponse devrait typer correctement les données', () => {
      interface User {
        id: number;
        name: string;
      }

      const response: PaginatedResponse<User> = {
        data: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5,
      };

      expect(response.data).toHaveLength(2);
      expect(response.totalPages).toBe(5);
    });
  });
});
