import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto, AddMemberDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  // 📋 Liste des comptes de l'utilisateur (owned + member)
  async findAll(userId: number) {
    const ownedAccounts = await this.prisma.account.findMany({
      where: { ownerId: userId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sharedAccounts = await this.prisma.accountMember.findMany({
      where: { userId },
      include: {
        account: {
          include: {
            owner: { select: { id: true, name: true, email: true, avatar: true } },
            members: {
              include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
            },
            _count: { select: { transactions: true } },
          },
        },
      },
    });

    return {
      owned: ownedAccounts,
      shared: sharedAccounts.map((m) => m.account),
    };
  }

  // 🔍 Détails d'un compte
  async findOne(id: number, userId: number) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        transactions: {
          take: 20,
          orderBy: { date: 'desc' },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { transactions: true } },
      },
    });

    if (!account) {
      throw new NotFoundException(`Compte #${id} introuvable`);
    }

    // Vérifier que l'utilisateur a accès
    const hasAccess =
      account.ownerId === userId ||
      account.members.some((m) => m.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('Accès refusé à ce compte');
    }

    return account;
  }

  // ➕ Créer un compte
  async create(userId: number, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        name: dto.name,
        type: dto.type,
        currency: dto.currency || 'EUR',
        balance: dto.balance || 0,
        ownerId: userId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  // ✏️ Mettre à jour un compte
  async update(id: number, userId: number, dto: UpdateAccountDto) {
    const account = await this.findOne(id, userId);

    // Seul le propriétaire peut modifier
    if (account.ownerId !== userId) {
      throw new ForbiddenException('Seul le propriétaire peut modifier ce compte');
    }

    return this.prisma.account.update({
      where: { id },
      data: dto,
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
      },
    });
  }

  // 🗑️ Supprimer un compte
  async remove(id: number, userId: number) {
    const account = await this.findOne(id, userId);

    if (account.ownerId !== userId) {
      throw new ForbiddenException('Seul le propriétaire peut supprimer ce compte');
    }

    await this.prisma.account.delete({ where: { id } });
    return { message: 'Compte supprimé avec succès' };
  }

  // 👥 Ajouter un membre
  async addMember(accountId: number, userId: number, dto: AddMemberDto) {
    const account = await this.findOne(accountId, userId);

    if (account.ownerId !== userId) {
      throw new ForbiddenException('Seul le propriétaire peut ajouter des membres');
    }

    // Vérifier que l'utilisateur existe
    const userToAdd = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!userToAdd) {
      throw new NotFoundException(`Utilisateur #${dto.userId} introuvable`);
    }

    // Vérifier qu'il n'est pas déjà membre
    const existingMember = await this.prisma.accountMember.findUnique({
      where: {
        accountId_userId: {
          accountId,
          userId: dto.userId,
        },
      },
    });

    if (existingMember) {
      throw new ForbiddenException('Cet utilisateur est déjà membre du compte');
    }

    return this.prisma.accountMember.create({
      data: {
        accountId,
        userId: dto.userId,
        role: dto.role || 'MEMBER',
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  // 🚪 Retirer un membre
  async removeMember(accountId: number, memberId: number, userId: number) {
    const account = await this.findOne(accountId, userId);

    if (account.ownerId !== userId) {
      throw new ForbiddenException('Seul le propriétaire peut retirer des membres');
    }

    const member = await this.prisma.accountMember.findUnique({
      where: {
        accountId_userId: {
          accountId,
          userId: memberId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Membre introuvable');
    }

    await this.prisma.accountMember.delete({
      where: {
        accountId_userId: {
          accountId,
          userId: memberId,
        },
      },
    });

    return { message: 'Membre retiré avec succès' };
  }
}
