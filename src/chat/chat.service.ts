import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import * as Redis from 'ioredis';
import { PubSub } from 'apollo-server-express';

const CHAT_USERS_TAG = 'chatUsers';

export const EVENT_CHAT_USER_ENTERED = 'chatUserEntered';
export const EVENT_CHAT_USER_LEAVED = 'chatUserLeaved';

@Injectable()
export class ChatService {
  readonly pubSub = new PubSub();

  private client: Redis.Redis;

  private users: string[];

  constructor(redisService: RedisService) {
    this.client = redisService.getClient();
  }

  /**
   * Load all users from redis and parses it
   */
  private async loadUsers() {
    this.users = JSON.parse((await this.client.get(CHAT_USERS_TAG)) ?? '[]');
  }

  /**
   * Persists all data changed
   */
  private async save() {
    await this.client.set(CHAT_USERS_TAG, JSON.stringify(this.users));
  }

  /**
   * Adds new user to the chat and publish as subscription event
   */
  async enterChat(nickname: string) {
    await this.loadUsers();

    if (this.users.includes(nickname)) {
      return;
    }

    this.users.push(nickname);
    await this.save();

    this.pubSub.publish(EVENT_CHAT_USER_ENTERED, {
      [EVENT_CHAT_USER_ENTERED]: nickname,
    });
  }

  /**
   * Removes user from chat and publish as subscription event
   */
  async leaveChat(nickname: string) {
    await this.loadUsers();

    if (!this.users.includes(nickname)) {
      return;
    }

    this.users = this.users.filter((el) => el !== nickname);
    await this.save();

    this.pubSub.publish(EVENT_CHAT_USER_LEAVED, {
      [EVENT_CHAT_USER_LEAVED]: nickname,
    });
  }

  async listUsers() {
    await this.loadUsers();
    return this.users;
  }

  /**
   * Check if a given nickname is present in the chat
   */
  async checkUserInChat(nickname: string) {
    await this.loadUsers();
    return this.users.includes(nickname);
  }
}
