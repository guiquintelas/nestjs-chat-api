import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { publishMessageSent } from 'src/utils/pubSub.manager';
import { ChatService } from '../chat/chat.service';
import { Message } from './message.entity';

export const EVENT_MESSAGE_SENT = 'messageSent';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private readonly chatService: ChatService,
  ) {}

  /**
   * Sends a new message to the chat given the nickname and content given
   * - Throws an BadRequest error if the nickname given isn't include in chat
   * - Otherwise publishes the new message as a subscription event
   */
  async sendMessage(content: string, nickname: string): Promise<Message> {
    if (!(await this.chatService.checkUserInChat(nickname))) {
      throw new BadRequestException('Please enter the chat before sending any messages!');
    }

    const message = this.messagesRepository.create({
      content,
      createdBy: nickname,
    });

    await this.messagesRepository.save(message);
    await publishMessageSent(message);

    return message;
  }

  /**
   * Lists all messages from chat from oldest to newest
   */
  async listMessages(): Promise<Message[]> {
    return this.messagesRepository.find({
      order: {
        createdAt: 'ASC',
      },
    });
  }
}
