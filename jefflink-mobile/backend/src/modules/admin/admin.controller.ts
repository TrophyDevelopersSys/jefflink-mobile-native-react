import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  ParseUUIDPipe,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Roles('ADMIN', 'MANAGER', 'SYSTEM_ADMIN', 'DIRECTOR')
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Dashboard stats' })
  getStats() {
    return this.svc.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.getUsers(page, limit);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status' })
  updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: 'ACTIVE' | 'SUSPENDED' | 'BANNED',
  ) {
    return this.svc.updateUserStatus(id, status);
  }

  @Get('contracts')
  @ApiOperation({ summary: 'List all contracts' })
  getContracts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.getContracts(page, limit);
  }

  @Get('payments')
  @ApiOperation({ summary: 'List all payments' })
  getPayments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.getPayments(page, limit);
  }

  @Get('recovery')
  @ApiOperation({ summary: 'Get pending recovery withdrawals' })
  getRecovery() {
    return this.svc.getPendingWithdrawals();
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger recovery sync' })
  sync() {
    return this.svc.syncRecovery();
  }
}
