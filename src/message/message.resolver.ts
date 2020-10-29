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
    return this.messagesRepository.find();
  }

  @Mutation(() => Message)
  async messageCreate(): Promise<Message> {
    const message = this.messagesRepository.create({
      content: 'test',
      createdBy: 'ey',
    });

    await this.messagesRepository.save(message);

    return message;
  }
}
