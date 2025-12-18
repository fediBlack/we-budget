import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // 📋 GET /transactions?accountId=1 - Liste des transactions
  @Get()
  findAll(@Query('accountId', ParseIntPipe) accountId: number, @Request() req: ExpressRequest & { user: { userId: number } }) {
    return this.transactionsService.findAll(accountId, req.user.userId);
  }

  // 🔍 GET /transactions/:id - Détails d'une transaction
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: ExpressRequest & { user: { userId: number } }) {
    return this.transactionsService.findOne(id, req.user.userId);
  }

  // ➕ POST /transactions - Créer une transaction
  @Post()
  create(@Request() req: ExpressRequest & { user: { userId: number } }, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.userId, dto);
  }

  // ✏️ PUT /transactions/:id - Mettre à jour une transaction
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest & { user: { userId: number } },
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, req.user.userId, dto);
  }

  // 🗑️ DELETE /transactions/:id - Supprimer une transaction
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: ExpressRequest & { user: { userId: number } }) {
    return this.transactionsService.remove(id, req.user.userId);
  }

  // 📊 GET /transactions/stats/:accountId - Statistiques
  @Get('stats/:accountId')
  getStatistics(@Param('accountId', ParseIntPipe) accountId: number, @Request() req: ExpressRequest & { user: { userId: number } }) {
    return this.transactionsService.getStatistics(accountId, req.user.userId);
  }
}
