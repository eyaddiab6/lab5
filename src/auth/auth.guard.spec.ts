import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  const jwtService: any = { verifyAsync: jest.fn() };
  const revokedTokenModel: any = { exists: jest.fn() };
  const makeContext = (authorization?: string): ExecutionContext => ({
    switchToHttp: () => ({ getRequest: () => ({ headers: { authorization } }) })
  } as any);

  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when the bearer token is missing', async () => {
    const guard = new AuthGuard(jwtService, revokedTokenModel);
    await expect(guard.canActivate(makeContext())).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns 401 when token was invalidated by logout', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'a1', jti: 'j1', email: 'e@x.com', role: 'user' });
    revokedTokenModel.exists.mockResolvedValue({ _id: 'r1' });
    const guard = new AuthGuard(jwtService, revokedTokenModel);
    await expect(guard.canActivate(makeContext('Bearer valid'))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches verified payload to request.user', async () => {
    const request: any = { headers: { authorization: 'Bearer valid' } };
    const ctx = { switchToHttp: () => ({ getRequest: () => request }) } as any;
    const payload = { sub: 'a1', jti: 'j1', email: 'e@x.com', role: 'user' };
    jwtService.verifyAsync.mockResolvedValue(payload);
    revokedTokenModel.exists.mockResolvedValue(null);
    const guard = new AuthGuard(jwtService, revokedTokenModel);
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request.user).toEqual(payload);
  });
});
