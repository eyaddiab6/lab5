import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from './todo.schema';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
    AccountModule,
  ],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
