/**
 * Test de l'export global
 * But : Vérifier que tous les exports sont accessibles depuis '@webudget/shared-types'
 */

import * as SharedTypes from '../src';

describe('Package Exports', () => {
  it('devrait exporter tous les enums', () => {
    expect(SharedTypes.UserRole).toBeDefined();
    expect(SharedTypes.AccountType).toBeDefined();
    expect(SharedTypes.Currency).toBeDefined();
    expect(SharedTypes.TransactionCategory).toBeDefined();
    expect(SharedTypes.TransactionType).toBeDefined();
    expect(SharedTypes.ParticipantStatus).toBeDefined();
    expect(SharedTypes.SettlementStatus).toBeDefined();
    expect(SharedTypes.MessageType).toBeDefined();
    expect(SharedTypes.ChatGroupType).toBeDefined();
    expect(SharedTypes.NotificationType).toBeDefined();
    expect(SharedTypes.RecurrenceFrequency).toBeDefined();
  });

  it('devrait permettre l\'import sélectif', () => {
    // ✅ Les ENUMS peuvent être déstructurés (ce sont des valeurs JS)
    const { Currency } = SharedTypes;

    // TypeScript vérifie que ces types existent
    expect(Currency.EUR).toBe('EUR');
    
    // 🎯 Les INTERFACES ne peuvent pas être déstructurées (types seulement)
    // User et RegisterDto sont des types, pas des valeurs
    // On peut seulement les utiliser pour typer :
    // const user: SharedTypes.User = { ... }
  });

  it('devrait supporter les imports par catégorie', () => {
    // 🎯 Les interfaces TypeScript (User, RegisterDto, etc.) n'existent PAS en JavaScript
    // Elles disparaissent après la compilation TypeScript
    // Seuls les ENUMS sont présents à l'exécution
    
    // ✅ Les enums sont visibles (ce sont des objets JavaScript)
    expect(SharedTypes).toHaveProperty('UserRole');
    expect(SharedTypes).toHaveProperty('Currency');
    expect(SharedTypes).toHaveProperty('AccountType');
    
    // ❌ Les interfaces ne sont PAS visibles à l'exécution
    // RegisterDto, User, etc. sont utilisables uniquement pour typer :
    // import { RegisterDto } from '@webudget/shared-types'
    // const dto: RegisterDto = { email: '...', ... }
  });
});
