import { AccountRole } from '../account/account.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  role: AccountRole;
  jti: string;
  iat?: number;
  exp?: number;
}
