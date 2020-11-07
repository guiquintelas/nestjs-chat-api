import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { EVENT_CHAT_USER_ENTERED, EVENT_CHAT_USER_LEAVED, getAsyncIterator } from 'src/utils/pubSub.manager';
import { ChatService } from './chat.service';

@Resolver()
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Query(() => [String])
  async chatListUsers() {
    return this.chatService.listUsers();
  }

  @Mutation(() => Boolean)
  async chatEnter(@Args('nickname') nickname: string): Promise<Boolean> {
    await this.chatService.enterChat(nickname);
    return true;
  }

  @Mutation(() => Boolean)
  async chatLeave(@Args('nickname') nickname: string): Promise<Boolean> {
    await this.chatService.leaveChat(nickname);
    return true;
  }

  @Subscription(() => String)
  chatUserEntered() {
    return getAsyncIterator(EVENT_CHAT_USER_ENTERED);
  }

  @Subscription(() => String)
  chatUserLeaved() {
    return getAsyncIterator(EVENT_CHAT_USER_LEAVED);
  }
}
