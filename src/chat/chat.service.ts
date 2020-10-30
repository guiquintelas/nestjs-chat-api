import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import * as Redis from 'ioredis';
import { PubSub } from 'apollo-server-express';

const CHAT_USERS_TAG = 'chatUsers';

export const EVENT_CHAT_USER_ENTERED = 'chatUserEntered';
export const EVENT_CHAT_USER_LEAVED = 'chatUserLeaved';

@Injectable()
export class ChatService implements OnModuleInit {
  readonly pubSub = new PubSub();

  private client: Redis.Redis;

  private users: string[];

  constructor(redisService: RedisService) {
    this.client = redisService.getClient();
  }

  async onModuleInit() {
    this.users = JSON.parse((await this.client.get(CHAT_USERS_TAG)) ?? '[]');
  }

  private async save() {
    await this.client.set(CHAT_USERS_TAG, JSON.stringify(this.users));
  }

  async enterChat(nickname: string) {
    if (this.users.includes(nickname)) {
      return;
    }

    this.users.push(nickname);
    await this.save();

    this.pubSub.publish(EVENT_CHAT_USER_ENTERED, {
      [EVENT_CHAT_USER_ENTERED]: nickname,
    });
  }

  async leaveChat(nickname: string) {
    if (!this.users.includes(nickname)) {
      return;
    }

    this.users = this.users.filter((el) => el !== nickname);
    await this.save();

    this.pubSub.publish(EVENT_CHAT_USER_LEAVED, {
      [EVENT_CHAT_USER_LEAVED]: nickname,
    });
  }

  listUsers() {
    return this.users;
  }

  checkUserInChat(nickname: string) {
    return this.users.includes(nickname);
  }
}
