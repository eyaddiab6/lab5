import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo, TodoDocument } from './todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private readonly todoModel: Model<TodoDocument>) {}

  create(dto: CreateTodoDto, user: JwtPayload) {
    return this.todoModel.create({ ...dto, owner: user.sub });
  }

  findAll(user: JwtPayload) {
    return this.todoModel.find(user.role === 'admin' ? {} : { owner: user.sub }).exec();
  }

  async findOne(id: string, user: JwtPayload) {
    const todo = await this.todoModel.findById(id).exec();
    this.assertAccess(todo, user);
    return todo;
  }

  async update(id: string, dto: UpdateTodoDto, user: JwtPayload) {
    const todo = await this.todoModel.findById(id).exec();
    this.assertAccess(todo, user);

    const updated = await this.todoModel.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).exec();
    if (!updated) throw new NotFoundException('Todo not found');
    return updated;
  }

  async remove(id: string, user: JwtPayload) {
    const todo = await this.todoModel.findById(id).exec();
    this.assertAccess(todo, user);

    const deleted = await this.todoModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Todo not found');
    return { message: 'Todo deleted successfully' };
  }

  private assertAccess(todo: TodoDocument | null, user: JwtPayload): asserts todo is TodoDocument {
    if (!todo) throw new NotFoundException('Todo not found');
    if (user.role !== 'admin' && String(todo.owner) !== user.sub) {
      throw new ForbiddenException('Forbidden');
    }
  }
}
