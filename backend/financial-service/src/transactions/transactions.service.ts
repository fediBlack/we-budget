import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  // 📋 Liste des transactions d'un compte
  async findAll(accountId: number, userId: number) {
    // Vérifier l'accès au compte
    await this.verifyAccountAccess(accountId, userId);

    return this.prisma.transaction.findMany({
      where: { accountId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  // 🔍 Détails d'une transaction
  async findOne(id: number, userId: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        account: true,
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction #${id} introuvable`);
    }

    // Vérifier l'accès au compte
    await this.verifyAccountAccess(transaction.accountId, userId);

    return transaction;
  }

  // ➕ Créer une transaction
  async create(userId: number, dto: CreateTransactionDto) {
    // Vérifier l'accès au compte
    await this.verifyAccountAccess(dto.accountId, userId);

    const transaction = await this.prisma.transaction.create({
      data: {
        accountId: dto.accountId,
        userId,
        amount: new Decimal(dto.amount),
        type: dto.type,
        category: dto.category,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Mettre à jour le solde du compte
    await this.updateAccountBalance(dto.accountId);

    return transaction;
  }

  // ✏️ Mettre à jour une transaction
  async update(id: number, userId: number, dto: UpdateTransactionDto) {
    const transaction = await this.findOne(id, userId);

    // Seul le créateur peut modifier
    if (transaction.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres transactions');
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        amount: dto.amount ? new Decimal(dto.amount) : undefined,
        type: dto.type,
        category: dto.category,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Recalculer le solde
    await this.updateAccountBalance(transaction.accountId);

    return updated;
  }

  // 🗑️ Supprimer une transaction
  async remove(id: number, userId: number) {
    const transaction = await this.findOne(id, userId);

    if (transaction.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres transactions');
    }

    await this.prisma.transaction.delete({ where: { id } });

    // Recalculer le solde
    await this.updateAccountBalance(transaction.accountId);

    return { message: 'Transaction supprimée avec succès' };
  }

  // 📊 Statistiques d'un compte
  async getStatistics(accountId: number, userId: number) {
    await this.verifyAccountAccess(accountId, userId);

    const transactions = await this.prisma.transaction.findMany({
      where: { accountId },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const byCategory = transactions.reduce((acc, t) => {
      const cat = t.category;
      if (!acc[cat]) {
        acc[cat] = { income: 0, expense: 0, count: 0 };
      }
      if (t.type === 'INCOME') acc[cat].income += Number(t.amount);
      if (t.type === 'EXPENSE') acc[cat].expense += Number(t.amount);
      acc[cat].count += 1;
      return acc;
    }, {} as Record<string, { income: number; expense: number; count: number }>);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
      byCategory,
    };
  }

  // 🔒 Vérifier l'accès au compte
  private async verifyAccountAccess(accountId: number, userId: number) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { members: true },
    });

    if (!account) {
      throw new NotFoundException(`Compte #${accountId} introuvable`);
    }

    const hasAccess =
      account.ownerId === userId ||
      account.members.some((m) => m.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('Accès refusé à ce compte');
    }

    return account;
  }

  // 💰 Mettre à jour le solde du compte
  private async updateAccountBalance(accountId: number) {
    const transactions = await this.prisma.transaction.findMany({
      where: { accountId },
    });

    const balance = transactions.reduce((sum, t: any) => {
      const amount = Number(t.amount);
      if (t.type === 'INCOME') return sum + amount;
      if (t.type === 'EXPENSE') return sum - amount;
      return sum;
    }, 0);

    await (this.prisma as any).account.update({
      where: { id: accountId },
      data: { balance: new Decimal(balance) },
    });
  }
}
