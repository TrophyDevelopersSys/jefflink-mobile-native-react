import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller({ path: 'transactions', version: '1' })
export class TransactionsController {
  constructor(private readonly svc: TransactionsService) {}

  // ── Contracts ──────────────────────────────────────────────────────────────

  @Get('contracts')
  @ApiOperation({ summary: 'List contracts for current user' })
  getContracts(@CurrentUser() user: AuthUser) {
    const isAdmin = ['ADMIN', 'MANAGER', 'SYSTEM_ADMIN', 'DIRECTOR'].includes(user.role);
    return this.svc.getContracts(user.sub, isAdmin);
  }

  @Get('contracts/:id')
  @ApiOperation({ summary: 'Get contract by ID' })
  getContract(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = ['ADMIN', 'MANAGER', 'SYSTEM_ADMIN', 'DIRECTOR'].includes(user.role);
    return this.svc.getContractById(id, user.sub, isAdmin);
  }

  @Post('contracts/:id/activate')
  @Roles('ADMIN', 'MANAGER', 'SYSTEM_ADMIN', 'DIRECTOR', 'FINANCE_OFFICER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a contract' })
  activateContract(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.activateContract(id);
  }

  @Post('contracts/:id/transition')
  @Roles('ADMIN', 'MANAGER', 'SYSTEM_ADMIN', 'DIRECTOR', 'FINANCE_OFFICER', 'RECOVERY_AGENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transition contract FSM state' })
  transitionContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.svc.transitionContract(id, status as any);
  }

  // ── Payments ───────────────────────────────────────────────────────────────

  @Get('payments')
  @ApiOperation({ summary: 'List payments for current user' })
  getPayments(@CurrentUser() user: AuthUser) {
    const isAdmin = ['ADMIN', 'MANAGER', 'SYSTEM_ADMIN', 'DIRECTOR', 'FINANCE_OFFICER'].includes(user.role);
    return this.svc.getPayments(user.sub, undefined, isAdmin);
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get payment by ID' })
  getPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = ['ADMIN', 'MANAGER', 'SYSTEM_ADMIN', 'DIRECTOR', 'FINANCE_OFFICER'].includes(user.role);
    return this.svc.getPaymentById(id, user.sub, isAdmin);
  }

  @Post('payments/:id/approve')
  @Roles('ADMIN', 'MANAGER', 'FINANCE_OFFICER', 'DIRECTOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a pending payment' })
  approvePayment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { debitAccount: string; creditAccount: string },
  ) {
    return this.svc.approvePayment(id, user.sub, body.debitAccount, body.creditAccount);
  }

  // ── Webhook ────────────────────────────────────────────────────────────────

  @Public()
  @Post('payments/webhook/momo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'MoMo payment webhook handler' })
  momoWebhook(@Body() body: any) {
    return this.svc.handleMomoWebhook(body);
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  @Post('admin/penalty-sweep')
  @Roles('ADMIN', 'MANAGER', 'SYSTEM_ADMIN', 'DIRECTOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger penalty sweep' })
  penaltySweep(@Body() body: { graceDays?: number; defaultDays?: number }) {
    return this.svc.runPenaltySweep(body.graceDays, body.defaultDays);
  }
}
