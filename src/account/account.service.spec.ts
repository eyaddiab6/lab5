import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AccountService } from './account.service';
import * as bcrypt from 'bcrypt';

describe('AccountService', () => {
  const accountModel: any = {
    findOne: jest.fn(),
    create: jest.fn(),
  };
  const revokedTokenModel: any = { create: jest.fn() };
  const jwtService: any = { signAsync: jest.fn() };
  let service: AccountService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AccountService(accountModel, revokedTokenModel, jwtService);
  });

  it('registers a user with a bcrypt hash and never returns password', async () => {
    accountModel.findOne.mockResolvedValue(null);
    accountModel.create.mockImplementation(async (data: any) => ({
      _id: 'acc1', ...data, toObject: () => ({ _id: 'acc1', ...data })
    }));

    const result = await service.register({ name: 'Eyad', email: 'EYAD@EXAMPLE.COM', password: 'Secret123!' });

    expect(accountModel.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Eyad', email: 'eyad@example.com', role: 'user'
    }));
    const saved = accountModel.create.mock.calls[0][0];
    expect(saved.password).not.toBe('Secret123!');
    expect(await bcrypt.compare('Secret123!', saved.password)).toBe(true);
    expect((result as any).password).toBeUndefined();
  });

  it('throws 409 when email already exists', async () => {
    accountModel.findOne.mockResolvedValue({ _id: 'existing' });
    await expect(service.register({ name: 'Eyad', email: 'eyad@example.com', password: 'Secret123!' }))
      .rejects.toBeInstanceOf(ConflictException);
  });

  it('returns a JWT for valid credentials', async () => {
    const hash = await bcrypt.hash('Secret123!', 10);
    accountModel.findOne.mockResolvedValue({ _id: 'acc1', email: 'eyad@example.com', password: hash, role: 'user' });
    jwtService.signAsync.mockResolvedValue('token123');

    await expect(service.login({ email: 'eyad@example.com', password: 'Secret123!' }))
      .resolves.toEqual({ access_token: 'token123' });
    expect(jwtService.signAsync).toHaveBeenCalledWith(expect.objectContaining({ sub: 'acc1', email: 'eyad@example.com', role: 'user' }));
  });

  it('uses the same generic 401 message for bad email or bad password', async () => {
    accountModel.findOne.mockResolvedValue(null);
    await expect(service.login({ email: 'missing@example.com', password: 'wrong' }))
      .rejects.toMatchObject(new UnauthorizedException('Invalid credentials'));
  });
});
