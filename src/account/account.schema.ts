import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccountDocument = HydratedDocument<Account>;
export type AccountRole = 'user' | 'admin';

@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: true })
  password: string;

  @Prop({ enum: ['user', 'admin'], default: 'user' })
  role: AccountRole;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
