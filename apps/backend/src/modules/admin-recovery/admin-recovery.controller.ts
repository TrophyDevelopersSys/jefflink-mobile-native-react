import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AdminRecoveryService } from './admin-recovery.service';
import { AdminRecoveryRequestDto } from './dto/admin-recovery-request.dto';
import { AdminRecoveryResetDto } from './dto/admin-recovery-reset.dto';
import { AdminRecoveryInitiateDto } from './dto/admin-recovery-initiate.dto';
import { AdminRecoveryAuditQueryDto } from './dto/admin-recovery-audit-query.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthUser } from '../../common/types/auth-user.type';

function extractIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim() ?? '';
  return req.ip ?? '';
}

@ApiTags('admin-recovery')
@Controller({ path: 'admin-recovery', version: '1' })
export class AdminRecoveryController {
  constructor(private readonly svc: AdminRecoveryService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // Public: Self-Service Recovery Request
  // ═══════════════════════════════════════════════════════════════════════════

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post('request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request admin account recovery link (self-service)',
    description:
      'Generates a time-bound recovery token and sends it via email. ' +
      'Returns a generic response regardless of whether the email exists to prevent enumeration.',
  })
  @ApiOkResponse({ description: 'Generic confirmation message' })
  async requestRecovery(
    @Body() dto: AdminRecoveryRequestDto,
    @Req() req: Request,
  ) {
    return this.svc.requestRecovery(dto.email, {
      ipAddress: extractIp(req),
      userAgent: req.headers['user-agent'],
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Public: Reset Password with Recovery Token
  // ═══════════════════════════════════════════════════════════════════════════

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete admin password reset with recovery token',
    description:
      'Validates the recovery token, updates the password, and invalidates the token. ' +
      'All existing sessions (refresh tokens) are revoked.',
  })
  @ApiOkResponse({ description: 'Password reset confirmation' })
  async resetPassword(
    @Body() dto: AdminRecoveryResetDto,
    @Req() req: Request,
  ) {
    return this.svc.resetPassword(dto.userId, dto.token, dto.newPassword, {
      ipAddress: extractIp(req),
      userAgent: req.headers['user-agent'],
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Protected: SUPER_ADMIN–Initiated Recovery
  // ═══════════════════════════════════════════════════════════════════════════

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Post('initiate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Initiate recovery for another admin (SUPER_ADMIN only)',
    description:
      'Allows a SUPER_ADMIN to trigger a password recovery for another admin account. ' +
      'A recovery link is sent to the target admin email. Self-initiation is not allowed.',
  })
  @ApiOkResponse({ description: 'Recovery email sent confirmation' })
  async initiateRecovery(
    @Body() dto: AdminRecoveryInitiateDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.svc.initiateRecovery(dto.userId, user.sub, {
      ipAddress: extractIp(req),
      userAgent: req.headers['user-agent'],
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Protected: Revoke Active Tokens (SUPER_ADMIN only)
  // ═══════════════════════════════════════════════════════════════════════════

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Post('revoke/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Revoke all active recovery tokens for a user (SUPER_ADMIN only)',
  })
  async revokeTokens(
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.svc.revokeTokens(userId, user.sub, {
      ipAddress: extractIp(req),
      userAgent: req.headers['user-agent'],
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Protected: Audit Log (SUPER_ADMIN only)
  // ═══════════════════════════════════════════════════════════════════════════

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Get('audit')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'View admin recovery audit log (SUPER_ADMIN only)',
    description:
      'Returns a paginated, filtered list of all admin recovery events. ' +
      'Emails are masked in the response.',
  })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAuditLog(@Query() query: AdminRecoveryAuditQueryDto) {
    return this.svc.getAuditLog({
      action: query.action,
      page: query.page ?? 1,
      limit: query.limit ?? 50,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Protected: Cleanup Expired Tokens (SUPER_ADMIN only)
  // ═══════════════════════════════════════════════════════════════════════════

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Clean up expired recovery tokens (SUPER_ADMIN only)',
  })
  async cleanupExpiredTokens() {
    return this.svc.cleanupExpiredTokens();
  }
}
