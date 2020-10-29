import { PubSub } from 'apollo-server-express';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

const pubSub = new PubSub();
const MESSAGE_SENT = 'messageSent';

@Resolver()
export class MessageResolver {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  @Query(() => [Message])
  async messages(): Promise<Message[]> {
    return this.messagesRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  @Mutation(() => Message)
  async messageSend(@Args('content') content: string, @Args('nickname') nickname: string): Promise<Message> {
    const message = this.messagesRepository.create({
      content,
      createdBy: nickname,
    });

    await this.messagesRepository.save(message);
    pubSub.publish(MESSAGE_SENT, {
      [MESSAGE_SENT]: message,
    });

    return message;
  }

  @Subscription(() => Message)
  messageSent() {
    return pubSub.asyncIterator(MESSAGE_SENT);
  }
}
