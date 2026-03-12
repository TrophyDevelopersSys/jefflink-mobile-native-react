import { AppRole } from '../decorators/roles.decorator';

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  role: AppRole;
  branchId?: string;
}
