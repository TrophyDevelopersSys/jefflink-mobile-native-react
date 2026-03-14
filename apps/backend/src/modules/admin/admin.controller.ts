import {
  Controller,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminGuard } from './guards/admin.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ApproveListingDto, RejectListingDto } from './dto/approve-listing.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { VerifyVendorDto, SuspendVendorDto } from './dto/vendor-action.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard, RolesGuard)
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // Dashboard & Analytics
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('dashboard')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_ADMIN', 'DIRECTOR', 'MANAGER')
  @ApiOperation({ summary: 'Full platform dashboard stats' })
  getDashboard() {
    return this.svc.getDashboardStats();
  }

  @Get('analytics/revenue')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'FINANCE_OFFICER', 'AUDITOR', 'DIRECTOR')
  @ApiOperation({ summary: '6-month revenue timeline' })
  getRevenueTimeline() {
    return this.svc.getRevenueTimeline();
  }

  @Get('analytics/activity')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_ADMIN', 'DIRECTOR')
  @ApiOperation({ summary: 'Recent admin audit activity' })
  getRecentActivity(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.getRecentActivity(limit);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // User Management
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('users')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_ADMIN', 'MANAGER', 'SUPPORT')
  @ApiOperation({ summary: 'List all users (paginated)' })
  @ApiQuery({ name: 'search', required: false })
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.svc.listUsers(page, limit, search);
  }

  @Get('users/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_ADMIN', 'MANAGER', 'SUPPORT')
  @ApiOperation({ summary: 'Get user detail with roles and vendor profile' })
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.getUserById(id);
  }

  @Patch('users/:id/status')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Suspend, activate, or ban a user' })
  updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.svc.updateUserStatus(
      { sub: user.sub, role: user.role, ipAddress: req.ip },
      id,
      dto,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Vendor Management
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('vendors')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPPORT')
  @ApiOperation({ summary: 'List all vendor profiles' })
  getVendors(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.listVendors(page, limit);
  }

  @Get('vendors/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPPORT')
  @ApiOperation({ summary: 'Get vendor detail' })
  getVendorById(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.getVendorDetail(id);
  }

  @Patch('vendors/:id/verify')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Verify a vendor' })
  verifyVendor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyVendorDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.svc.verifyVendor(
      { sub: user.sub, role: user.role, ipAddress: req.ip },
      id,
      dto,
    );
  }

  @Patch('vendors/:id/suspend')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Suspend a vendor' })
  suspendVendor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SuspendVendorDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.svc.suspendVendor(
      { sub: user.sub, role: user.role, ipAddress: req.ip },
      id,
      dto,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Listings Moderation
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('listings/pending')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Vehicles pending moderation review' })
  getPendingVehicles(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.getPendingVehicles(page, limit);
  }

  @Patch('listings/vehicles/:id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Approve a vehicle listing' })
  approveVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveListingDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.svc.approveVehicle(
      { sub: user.sub, role: user.role, ipAddress: req.ip },
      id,
      dto,
    );
  }

  @Patch('listings/vehicles/:id/reject')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Reject a vehicle listing' })
  rejectVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectListingDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.svc.rejectVehicle(
      { sub: user.sub, role: user.role, ipAddress: req.ip },
      id,
      dto,
    );
  }

  @Get('listings/properties/pending')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Properties pending moderation review' })
  getPendingProperties(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.getPendingProperties(page, limit);
  }

  @Patch('listings/properties/:id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Approve a property listing' })
  approveProperty(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveListingDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.svc.approveProperty(
      { sub: user.sub, role: user.role, ipAddress: req.ip },
      id,
      dto,
    );
  }

  @Patch('listings/properties/:id/reject')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Reject a property listing' })
  rejectProperty(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectListingDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.svc.rejectProperty(
      { sub: user.sub, role: user.role, ipAddress: req.ip },
      id,
      dto,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Reports
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('reports')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT')
  @ApiOperation({ summary: 'List listing reports' })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'RESOLVED', 'DISMISSED'] })
  getReports(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: 'OPEN' | 'RESOLVED' | 'DISMISSED',
  ) {
    return this.svc.getReports(page, limit, status);
  }

  @Patch('reports/:id/resolve')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Resolve or dismiss a report' })
  resolveReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveReportDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.svc.resolveReport(
      { sub: user.sub, role: user.role, ipAddress: req.ip },
      id,
      dto,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Finance Administration
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('finance/summary')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'FINANCE_OFFICER', 'AUDITOR', 'DIRECTOR')
  @ApiOperation({ summary: 'Finance KPI summary' })
  getFinanceSummary() {
    return this.svc.getFinanceSummary();
  }

  @Get('contracts')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'FINANCE_OFFICER', 'AUDITOR')
  @ApiOperation({ summary: 'List all contracts' })
  getContracts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.listContracts(page, limit);
  }

  @Get('contracts/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'FINANCE_OFFICER', 'AUDITOR')
  @ApiOperation({ summary: 'Contract detail with payments and installment schedule' })
  getContractDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.getContractDetail(id);
  }

  @Get('payments')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'FINANCE_OFFICER', 'AUDITOR')
  @ApiOperation({ summary: 'List all payments' })
  getPayments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.listPayments(page, limit);
  }

  @Get('installments')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'FINANCE_OFFICER', 'AUDITOR')
  @ApiOperation({ summary: 'List installments' })
  @ApiQuery({ name: 'status', required: false })
  getInstallments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.svc.listInstallments(page, limit, status);
  }

  @Get('withdrawals')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'FINANCE_OFFICER')
  @ApiOperation({ summary: 'List vendor withdrawal requests' })
  getWithdrawals(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.listWithdrawals(page, limit);
  }

  @Patch('withdrawals/:id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a withdrawal request' })
  approveWithdrawal(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.svc.approveWithdrawal(
      { sub: user.sub, role: user.role, ipAddress: req.ip },
      id,
    );
  }

  @Patch('withdrawals/:id/reject')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a withdrawal request' })
  rejectWithdrawal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.svc.rejectWithdrawal(
      { sub: user.sub, role: user.role, ipAddress: req.ip },
      id,
      reason,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Audit Logs
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('audit-logs')
  @Roles('SUPER_ADMIN', 'AUDITOR', 'DIRECTOR')
  @ApiOperation({ summary: 'View admin audit logs' })
  getAuditLogs(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.svc.getRecentActivity(limit);
  }
}
