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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateContractDto } from './dto/create-contract.dto';
import { InitialDepositDto } from './dto/initial-deposit.dto';
import { MonthlyPaymentDto } from './dto/monthly-payment.dto';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller({ path: 'transactions', version: '1' })
export class TransactionsController {
  constructor(private readonly svc: TransactionsService) {}

  // ── Contracts ──────────────────────────────────────────────────────────────

  @Post('contracts')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create a hire-purchase contract with amortization schedule' })
  createContract(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateContractDto,
  ) {
    return this.svc.createContract(user.sub, dto);
  }

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

  @Get('contracts/:id/amortization')
  @ApiOperation({ summary: 'Get amortization schedule for a contract' })
  getAmortizationSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = ['ADMIN', 'MANAGER', 'SYSTEM_ADMIN', 'DIRECTOR', 'FINANCE_OFFICER'].includes(user.role);
    return this.svc.getAmortizationSchedule(id, user.sub, isAdmin);
  }

  @Post('contracts/:id/initial-deposit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record initial deposit payment for a contract' })
  recordInitialDeposit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: InitialDepositDto,
  ) {
    return this.svc.recordInitialDeposit(id, user.sub, dto);
  }

  @Post('contracts/:id/monthly-payment/:installmentId')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a monthly instalment payment' })
  recordMonthlyPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('installmentId', ParseUUIDPipe) installmentId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: MonthlyPaymentDto,
  ) {
    return this.svc.recordMonthlyPayment(id, installmentId, user.sub, dto);
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
