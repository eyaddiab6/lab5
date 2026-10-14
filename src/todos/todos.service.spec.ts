import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TodosService } from './todos.service';

describe('TodosService', () => {
  const todoModel: any = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };
  let service: TodosService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TodosService(todoModel);
  });

  it('forces owner from authenticated account when creating a todo', async () => {
    todoModel.create.mockResolvedValue({ _id: 't1' });
    await service.create({ title: 'Study', description: 'NestJS' }, { sub: 'owner1', role: 'user', email: 'e@x.com', jti: 'j1' });
    expect(todoModel.create).toHaveBeenCalledWith(expect.objectContaining({ owner: 'owner1', title: 'Study' }));
  });

  it('returns only own todos for a normal user', async () => {
    todoModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    await service.findAll({ sub: 'owner1', role: 'user', email: 'e@x.com', jti: 'j1' });
    expect(todoModel.find).toHaveBeenCalledWith({ owner: 'owner1' });
  });

  it('returns all todos for admin', async () => {
    todoModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    await service.findAll({ sub: 'admin1', role: 'admin', email: 'a@x.com', jti: 'j1' });
    expect(todoModel.find).toHaveBeenCalledWith({});
  });

  it('throws 403 when a user accesses another owner todo', async () => {
    todoModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 't1', owner: 'owner2' }) });
    await expect(service.findOne('t1', { sub: 'owner1', role: 'user', email: 'e@x.com', jti: 'j1' }))
      .rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns 404 when todo does not exist', async () => {
    todoModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.findOne('missing', { sub: 'owner1', role: 'user', email: 'e@x.com', jti: 'j1' }))
      .rejects.toBeInstanceOf(NotFoundException);
  });
});
