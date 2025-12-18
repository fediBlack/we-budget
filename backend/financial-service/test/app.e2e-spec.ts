import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Financial Service (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: number;
  let accountId: number;
  let transactionId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // 🧹 Nettoyer la base de données
    await prisma.transaction.deleteMany();
    await prisma.accountMember.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // 👤 Créer un utilisateur de test
    const user = await prisma.user.create({
      data: {
        email: 'test@financial.com',
        name: 'Test User',
        role: 'USER',
      },
    });
    userId = user.id;

    // 🔑 Simuler un token JWT (simplifié pour les tests)
    // En production, générer un vrai token avec JwtService
    accessToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.accountMember.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('Accounts', () => {
    it('POST /accounts - Créer un compte personnel', async () => {
      const response = await request(app.getHttpServer())
        .post('/accounts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Mon Compte Courant',
          type: 'PERSONAL',
          currency: 'EUR',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Mon Compte Courant');
      expect(response.body.type).toBe('PERSONAL');
      expect(response.body.currency).toBe('EUR');
      expect(response.body.balance).toBe('0');
      expect(response.body.ownerId).toBe(userId);

      accountId = response.body.id;
    });

    it('GET /accounts - Lister les comptes', async () => {
      const response = await request(app.getHttpServer())
        .get('/accounts')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('owned');
      expect(response.body).toHaveProperty('shared');
      expect(response.body.owned).toHaveLength(1);
      expect(response.body.owned[0].name).toBe('Mon Compte Courant');
    });

    it('GET /accounts/:id - Détails d\'un compte', async () => {
      const response = await request(app.getHttpServer())
        .get(`/accounts/${accountId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(accountId);
      expect(response.body.name).toBe('Mon Compte Courant');
      expect(response.body.transactions).toBeDefined();
    });

    it('PUT /accounts/:id - Mettre à jour un compte', async () => {
      const response = await request(app.getHttpServer())
        .put(`/accounts/${accountId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Compte Courant Modifié',
        })
        .expect(200);

      expect(response.body.name).toBe('Compte Courant Modifié');
    });

    it('POST /accounts - Validation des champs requis', async () => {
      await request(app.getHttpServer())
        .post('/accounts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          // name manquant
          type: 'PERSONAL',
        })
        .expect(400);
    });
  });

  describe('Transactions', () => {
    it('POST /transactions - Créer une transaction', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          accountId,
          amount: 1000.50,
          type: 'INCOME',
          category: 'SALARY',
          description: 'Salaire de janvier',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.amount).toBe('1000.5');
      expect(response.body.type).toBe('INCOME');
      expect(response.body.category).toBe('SALARY');
      expect(response.body.accountId).toBe(accountId);

      transactionId = response.body.id;
    });

    it('GET /transactions?accountId=X - Lister les transactions', async () => {
      const response = await request(app.getHttpServer())
        .get(`/transactions?accountId=${accountId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].amount).toBe('1000.5');
    });

    it('GET /transactions/:id - Détails d\'une transaction', async () => {
      const response = await request(app.getHttpServer())
        .get(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(transactionId);
      expect(response.body.description).toBe('Salaire de janvier');
    });

    it('PUT /transactions/:id - Mettre à jour une transaction', async () => {
      const response = await request(app.getHttpServer())
        .put(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 1200.00,
          description: 'Salaire de janvier (ajusté)',
        })
        .expect(200);

      expect(response.body.amount).toBe('1200');
      expect(response.body.description).toBe('Salaire de janvier (ajusté)');
    });

    it('POST /transactions - Créer une dépense', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          accountId,
          amount: 50.75,
          type: 'EXPENSE',
          category: 'FOOD',
          description: 'Courses',
        })
        .expect(201);

      expect(response.body.type).toBe('EXPENSE');
      expect(response.body.amount).toBe('50.75');
    });

    it('GET /transactions/stats/:accountId - Statistiques', async () => {
      const response = await request(app.getHttpServer())
        .get(`/transactions/stats/${accountId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalIncome');
      expect(response.body).toHaveProperty('totalExpense');
      expect(response.body).toHaveProperty('balance');
      expect(response.body.totalIncome).toBe(1200);
      expect(response.body.totalExpense).toBe(50.75);
      expect(response.body.balance).toBe(1149.25);
    });

    it('DELETE /transactions/:id - Supprimer une transaction', async () => {
      await request(app.getHttpServer())
        .delete(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Vérifier qu'elle n'existe plus
      await request(app.getHttpServer())
        .get(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('POST /transactions - Validation: amount minimum', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          accountId,
          amount: 0, // Invalide
          type: 'EXPENSE',
          category: 'FOOD',
        })
        .expect(400);
    });
  });

  describe('Account Members', () => {
    let user2Id: number;

    beforeAll(async () => {
      const user2 = await prisma.user.create({
        data: {
          email: 'user2@financial.com',
          name: 'User 2',
          role: 'USER',
        },
      });
      user2Id = user2.id;
    });

    it('POST /accounts/:id/members - Ajouter un membre', async () => {
      const response = await request(app.getHttpServer())
        .post(`/accounts/${accountId}/members`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: user2Id,
          role: 'MEMBER',
        })
        .expect(201);

      expect(response.body.userId).toBe(user2Id);
      expect(response.body.accountId).toBe(accountId);
    });

    it('POST /accounts/:id/members - Rejet si déjà membre', async () => {
      await request(app.getHttpServer())
        .post(`/accounts/${accountId}/members`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: user2Id,
        })
        .expect(403); // Forbidden
    });

    it('DELETE /accounts/:id/members/:memberId - Retirer un membre', async () => {
      await request(app.getHttpServer())
        .delete(`/accounts/${accountId}/members/${user2Id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('Account Balance Updates', () => {
    it('Le solde du compte est mis à jour après création de transaction', async () => {
      // Créer une income
      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          accountId,
          amount: 500,
          type: 'INCOME',
          category: 'SALARY',
        })
        .expect(201);

      // Vérifier le solde
      const account = await request(app.getHttpServer())
        .get(`/accounts/${accountId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Balance devrait être 500 (income) - 50.75 (expense existante)
      expect(Number(account.body.balance)).toBeGreaterThan(0);
    });
  });

  describe('Authorization', () => {
    it('GET /accounts - Rejet sans token', async () => {
      await request(app.getHttpServer())
        .get('/accounts')
        .expect(401);
    });

    it('POST /transactions - Rejet sans token', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          accountId,
          amount: 100,
          type: 'EXPENSE',
          category: 'FOOD',
        })
        .expect(401);
    });
  });
});
