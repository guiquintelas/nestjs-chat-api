import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import {
  EVENT_CHAT_USER_CHANGED_ONLINE_STATUS,
  EVENT_CHAT_USER_ENTERED,
  EVENT_CHAT_USER_LEAVED,
  getAsyncIterator,
} from '../utils/pubSub.manager';
import { ChatService } from './chat.service';
import { ChatUserChangedOnlineStatus } from './dtos/chatUserChangedOnlineStatus.dto';

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

  @Subscription(() => ChatUserChangedOnlineStatus)
  chatUserChangedOnlineStatus() {
    return getAsyncIterator(EVENT_CHAT_USER_CHANGED_ONLINE_STATUS);
  }
}
