import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { RevokedToken, RevokedTokenDocument } from '../account/revoked-token.schema';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(RevokedToken.name)
    private readonly revokedTokenModel: Model<RevokedTokenDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractBearerToken(request.headers?.authorization);

    if (!token) throw new UnauthorizedException('Unauthorized');

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      if (!payload?.sub || !payload?.email || !payload?.role || !payload?.jti) {
        throw new UnauthorizedException('Unauthorized');
      }

      const revoked = await this.revokedTokenModel.exists({ jti: payload.jti });
      if (revoked) throw new UnauthorizedException('Unauthorized');

      request.user = payload;
      request.accessToken = token;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Unauthorized');
    }
  }

  private extractBearerToken(authorization?: string): string | undefined {
    if (!authorization) return undefined;
    const [type, token] = authorization.trim().split(/\s+/);
    return type === 'Bearer' && token ? token : undefined;
  }
}
