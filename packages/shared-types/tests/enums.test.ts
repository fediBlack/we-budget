/**
 * Tests des ENUMS
 * But : Vérifier que les enums ont les bonnes valeurs
 */

import {
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
} from '../src/enums';

describe('Enums', () => {
  describe('UserRole', () => {
    it('devrait avoir les valeurs correctes', () => {
      expect(UserRole.USER).toBe('USER');
      expect(UserRole.ADMIN).toBe('ADMIN');
      expect(UserRole.PREMIUM).toBe('PREMIUM');
    });

    it('devrait avoir exactement 3 valeurs', () => {
      expect(Object.keys(UserRole)).toHaveLength(3);
    });
  });

  describe('AccountType', () => {
    it('devrait avoir les valeurs correctes', () => {
      expect(AccountType.PERSONAL).toBe('PERSONAL');
      expect(AccountType.SHARED).toBe('SHARED');
    });
  });

  describe('Currency', () => {
    it('devrait supporter 9 devises', () => {
      expect(Object.keys(Currency)).toHaveLength(9);
    });

    it('devrait inclure les devises majeures', () => {
      expect(Currency.EUR).toBe('EUR');
      expect(Currency.USD).toBe('USD');
      expect(Currency.GBP).toBe('GBP');
      expect(Currency.JPY).toBe('JPY');
    });
  });

  describe('TransactionCategory', () => {
    it('devrait inclure les catégories essentielles', () => {
      expect(TransactionCategory.FOOD).toBe('FOOD');
      expect(TransactionCategory.TRANSPORT).toBe('TRANSPORT');
      expect(TransactionCategory.HOUSING).toBe('HOUSING');
      expect(TransactionCategory.HEALTH).toBe('HEALTH');
    });
  });

  describe('TransactionType', () => {
    it('devrait avoir 3 types de transaction', () => {
      expect(TransactionType.INCOME).toBe('INCOME');
      expect(TransactionType.EXPENSE).toBe('EXPENSE');
      expect(TransactionType.TRANSFER).toBe('TRANSFER');
    });
  });

  describe('ParticipantStatus', () => {
    it('devrait gérer les statuts d\'invitation', () => {
      expect(ParticipantStatus.INVITED).toBe('INVITED');
      expect(ParticipantStatus.ACCEPTED).toBe('ACCEPTED');
      expect(ParticipantStatus.DECLINED).toBe('DECLINED');
    });
  });

  describe('SettlementStatus', () => {
    it('devrait gérer les statuts de remboursement', () => {
      expect(SettlementStatus.PENDING).toBe('PENDING');
      expect(SettlementStatus.PAID).toBe('PAID');
      expect(SettlementStatus.CANCELLED).toBe('CANCELLED');
    });
  });

  describe('MessageType', () => {
    it('devrait supporter plusieurs types de message', () => {
      expect(MessageType.TEXT).toBe('TEXT');
      expect(MessageType.IMAGE).toBe('IMAGE');
      expect(MessageType.FILE).toBe('FILE');
      expect(MessageType.SYSTEM).toBe('SYSTEM');
    });
  });

  describe('ChatGroupType', () => {
    it('devrait distinguer les types de groupe', () => {
      expect(ChatGroupType.DIRECT).toBe('DIRECT');
      expect(ChatGroupType.GROUP).toBe('GROUP');
      expect(ChatGroupType.EVENT_LINKED).toBe('EVENT_LINKED');
    });
  });

  describe('NotificationType', () => {
    it('devrait couvrir les notifications essentielles', () => {
      expect(NotificationType.EVENT_INVITATION).toBe('EVENT_INVITATION');
      expect(NotificationType.PAYMENT_REMINDER).toBe('PAYMENT_REMINDER');
      expect(NotificationType.MESSAGE_RECEIVED).toBe('MESSAGE_RECEIVED');
    });
  });

  describe('RecurrenceFrequency', () => {
    it('devrait supporter les fréquences communes', () => {
      expect(RecurrenceFrequency.DAILY).toBe('DAILY');
      expect(RecurrenceFrequency.WEEKLY).toBe('WEEKLY');
      expect(RecurrenceFrequency.MONTHLY).toBe('MONTHLY');
      expect(RecurrenceFrequency.YEARLY).toBe('YEARLY');
    });
  });
});
