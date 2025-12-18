import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAccountDto, UpdateAccountDto, AddMemberDto } from './dto/account.dto';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  // 📋 GET /accounts - Liste des comptes
  @Get()
  findAll(@Request() req) {
    return this.accountsService.findAll(req.user.userId);
  }

  // 🔍 GET /accounts/:id - Détails d'un compte
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.accountsService.findOne(id, req.user.userId);
  }

  // ➕ POST /accounts - Créer un compte
  @Post()
  create(@Request() req, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(req.user.userId, dto);
  }

  // ✏️ PUT /accounts/:id - Mettre à jour un compte
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, req.user.userId, dto);
  }

  // 🗑️ DELETE /accounts/:id - Supprimer un compte
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.accountsService.remove(id, req.user.userId);
  }

  // 👥 POST /accounts/:id/members - Ajouter un membre
  @Post(':id/members')
  addMember(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() dto: AddMemberDto,
  ) {
    return this.accountsService.addMember(id, req.user.userId, dto);
  }

  // 🚪 DELETE /accounts/:id/members/:memberId - Retirer un membre
  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Request() req,
  ) {
    return this.accountsService.removeMember(id, memberId, req.user.userId);
  }
}
