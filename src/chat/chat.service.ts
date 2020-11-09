import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Redis from 'ioredis';
import { RedisService } from 'nestjs-redis';
import {
  publishUserEnteredChat,
  publishUserLeavedChat,
  subscribeToUserChangedOnlineStatus,
} from '../utils/pubSub.manager';
import { ChatUserChangedOnlineStatus, ConnectionType } from './dtos/chatUserChangedOnlineStatus.dto';

const CHAT_USERS_TAG = 'chatUsers';
const CHAT_ONLINE_USERS_TAG = 'chatOnlineUsers';

@Injectable()
export class ChatService implements OnModuleInit {
  private client: Redis.Redis;

  private users: string[];

  private onlineUsers: string[];

  constructor(redisService: RedisService) {
    this.client = redisService.getClient();
  }

  async onModuleInit() {
    await subscribeToUserChangedOnlineStatus(async (data) => {
      await this.handleSubConnectionStatusChange(data);
    });

    // clear online users
    this.onlineUsers = [];
    await this.save();
  }

  private async handleSubConnectionStatusChange({ type, user }: ChatUserChangedOnlineStatus) {
    await this.loadOnlineUsers();

    if (type === ConnectionType.DISCONNECTED) {
      this.onlineUsers = this.onlineUsers.filter((el) => el !== user);
    } else if (type === ConnectionType.CONNECTED) {
      this.onlineUsers.push(user);
    }

    await this.save();
  }

  /**
   * Load all users from redis and parses it
   */
  private async loadUsers() {
    this.users = JSON.parse((await this.client.get(CHAT_USERS_TAG)) ?? '[]');
  }

  /**
   * Load all online users from redis and parses it
   */
  private async loadOnlineUsers() {
    this.onlineUsers = JSON.parse((await this.client.get(CHAT_ONLINE_USERS_TAG)) ?? '[]');
  }

  /**
   * Persists all data changed
   */
  private async save() {
    if (typeof this.users !== 'undefined') {
      await this.client.set(CHAT_USERS_TAG, JSON.stringify(this.users));
    }

    if (typeof this.onlineUsers !== 'undefined') {
      await this.client.set(CHAT_ONLINE_USERS_TAG, JSON.stringify(this.onlineUsers));
    }
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
    await publishUserEnteredChat(nickname);
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
    await publishUserLeavedChat(nickname);
  }

  async listUsers() {
    await this.loadUsers();
    return this.users;
  }

  async listOnlineUsers() {
    await this.loadOnlineUsers();
    return this.onlineUsers;
  }

  /**
   * Check if a given nickname is present in the chat
   */
  async checkUserInChat(nickname: string) {
    await this.loadUsers();
    return this.users.includes(nickname);
  }
}
