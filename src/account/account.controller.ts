import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AccountService } from './account.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.accountService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.accountService.login(dto);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Req() request: Request & { user: JwtPayload }) {
    return this.accountService.logout(request.user);
  }
}
