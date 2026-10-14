import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Account, AccountDocument } from './account.schema';
import { RevokedToken, RevokedTokenDocument } from './revoked-token.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(RevokedToken.name)
    private readonly revokedTokenModel: Model<RevokedTokenDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.accountModel.findOne({ email });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const account = await this.accountModel.create({
        name: dto.name,
        email,
        password: hashedPassword,
        role: 'user',
      });
      return this.sanitizeAccount(account);
    } catch (error: any) {
      if (error?.code === 11000) throw new ConflictException('Email already exists');
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const email = dto.email.trim().toLowerCase();
    const account = await this.accountModel.findOne({ email });
    if (!account) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, account.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = {
      sub: String(account._id),
      email: account.email,
      role: account.role,
      jti: randomUUID(),
    };

    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async logout(payload: JwtPayload): Promise<{ message: string }> {
    const expiresAt = payload.exp
      ? new Date(payload.exp * 1000)
      : new Date(Date.now() + 60 * 60 * 1000);

    try {
      await this.revokedTokenModel.create({ jti: payload.jti, expiresAt });
    } catch (error: any) {
      if (error?.code !== 11000) throw error;
    }

    return { message: 'Logged out successfully' };
  }

  private sanitizeAccount(account: any) {
    const raw = typeof account.toObject === 'function' ? account.toObject() : { ...account };
    delete raw.password;
    return raw;
  }
}
