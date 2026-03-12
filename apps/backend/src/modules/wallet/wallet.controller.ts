import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { WalletService } from './wallet.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

class WithdrawDto {
  @IsNumber()
  @Min(1)
  amount!: number;

  @IsString()
  momoNumber!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

class ProcessWithdrawalDto {
  @IsString()
  action!: 'APPROVE' | 'REJECT';
}

@ApiTags('wallet')
@ApiBearerAuth()
@Controller({ path: 'wallet', version: '1' })
export class WalletController {
  constructor(private readonly svc: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get current vendor wallet' })
  getWallet(@CurrentUser() user: AuthUser) {
    return this.svc.getWallet(user.sub);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet ledger transactions' })
  getTransactions(@CurrentUser() user: AuthUser) {
    return this.svc.getTransactions(user.sub);
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'List withdrawal requests' })
  listWithdrawals(@CurrentUser() user: AuthUser) {
    const isAdmin = ['ADMIN', 'MANAGER', 'FINANCE_OFFICER', 'DIRECTOR'].includes(user.role);
    return this.svc.listWithdrawals(user.sub, isAdmin);
  }

  @Post('withdraw')
  @Roles('VENDOR', 'AGENT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request a withdrawal' })
  requestWithdrawal(
    @CurrentUser() user: AuthUser,
    @Body() dto: WithdrawDto,
  ) {
    return this.svc.requestWithdrawal(user.sub, dto.amount, dto.momoNumber, dto.note);
  }

  @Post('withdraw/:id/process')
  @Roles('ADMIN', 'MANAGER', 'FINANCE_OFFICER', 'DIRECTOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject a withdrawal' })
  processWithdrawal(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ProcessWithdrawalDto,
  ) {
    return this.svc.processWithdrawal(id, user.sub, dto.action);
  }
}
