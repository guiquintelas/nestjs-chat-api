import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from '../chat/chat.service';
import { Message } from './message.entity';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageResolver, MessageService, ChatService],
  exports: [TypeOrmModule, MessageService],
})
export class MessageModule {}
