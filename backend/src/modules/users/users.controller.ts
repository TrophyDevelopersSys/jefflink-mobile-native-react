import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get own profile' })
  getMe(@CurrentUser() user: AuthUser) {
    return this.usersService.findById(user.sub);
  }

  @Patch('me/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update own avatar URL' })
  @ApiBody({ schema: { properties: { avatarUrl: { type: 'string' } }, required: ['avatarUrl'] } })
  updateMyAvatar(
    @CurrentUser() user: AuthUser,
    @Body('avatarUrl') avatarUrl: string,
  ) {
    return this.usersService.updateAvatar(user.sub, avatarUrl);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }
}
