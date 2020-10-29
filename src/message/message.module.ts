import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageResolver } from './message.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageResolver],
  exports: [TypeOrmModule],
})
export class MessageModule {}
