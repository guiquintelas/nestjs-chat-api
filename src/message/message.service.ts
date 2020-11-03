import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'apollo-server-express';
import { ChatService } from 'src/chat/chat.service';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

export const EVENT_MESSAGE_SENT = 'messageSent';

@Injectable()
export class MessageService {
  readonly pubSub = new PubSub();

  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private readonly chatService: ChatService,
  ) {}

  async sendMessage(content: string, nickname: string): Promise<Message> {
    if (!(await this.chatService.checkUserInChat(nickname))) {
      throw new BadRequestException('Please enter the chat before sending any messages!');
    }

    const message = this.messagesRepository.create({
      content,
      createdBy: nickname,
    });

    await this.messagesRepository.save(message);

    this.pubSub.publish(EVENT_MESSAGE_SENT, {
      [EVENT_MESSAGE_SENT]: message,
    });

    return message;
  }

  async listMessages(): Promise<Message[]> {
    return this.messagesRepository.find({
      order: {
        createdAt: 'ASC',
      },
    });
  }
}
