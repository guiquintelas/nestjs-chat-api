import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

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

    return message;
  }
}
