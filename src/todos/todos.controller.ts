import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('todos')
@UseGuards(AuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() dto: CreateTodoDto, @Req() req: Request & { user: JwtPayload }) {
    return this.todosService.create(dto, req.user);
  }

  @Get()
  findAll(@Req() req: Request & { user: JwtPayload }) {
    return this.todosService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request & { user: JwtPayload }) {
    return this.todosService.findOne(id, req.user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTodoDto, @Req() req: Request & { user: JwtPayload }) {
    return this.todosService.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request & { user: JwtPayload }) {
    return this.todosService.remove(id, req.user);
  }
}
