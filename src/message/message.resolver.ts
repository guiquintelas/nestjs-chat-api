import { Args, Mutation, Query, Resolver, Subscription, Context } from '@nestjs/graphql';
import { ConnectionType } from 'src/chat/dtos/chatUserChangedOnlineStatus.dto';
import { getAsyncIterator, publishUserChangedOnlineStatus } from '../utils/pubSub.manager';
import { withCancel } from '../utils/resolver.helper';
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
  async messageSent(@Context() { payload }: any) {
    // on client subscribe
    await publishUserChangedOnlineStatus({
      type: ConnectionType.CONNECTED,
      user: payload.user,
    });

    return withCancel(getAsyncIterator(EVENT_MESSAGE_SENT), async () => {
      // on client unsubscribe
      await publishUserChangedOnlineStatus({
        type: ConnectionType.DISCONNECTED,
        user: payload.user,
      });
    });
  }
}
