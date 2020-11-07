import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from '../chat/chat.module';
import { Message } from './message.entity';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), ChatModule],
  providers: [MessageResolver, MessageService],
  exports: [TypeOrmModule, MessageService],
})
export class MessageModule {}
