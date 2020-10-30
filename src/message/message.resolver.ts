import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Message } from './message.entity';
import { EVENT_MESSAGE_SENT, MessageService } from './message.service';

@Resolver()
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Query(() => [Message])
  async messages(): Promise<Message[]> {
    return this.messageService.listMessages();
  }

  @Mutation(() => Message)
  async messageSend(@Args('content') content: string, @Args('nickname') nickname: string): Promise<Message> {
    return this.messageService.sendMessage(content, nickname);
  }

  @Subscription(() => Message)
  messageSent() {
    return this.messageService.pubSub.asyncIterator(EVENT_MESSAGE_SENT);
  }
}
