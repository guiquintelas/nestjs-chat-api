import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core';
import { WebSocketLink } from '@apollo/client/link/ws';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { gql } from 'apollo-server-express';
import * as Redis from 'ioredis';
import { RedisService } from 'nestjs-redis';
import { getConnection } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ChatService } from '../src/chat/chat.service';
import { createApolloClient, disposeApolloClient } from './testUtils';

const TEST_NICKNAME = 'fulano';
const ANOTHER_TEST_NICKNAME = 'fulano2';

describe('Chat Module', () => {
  let app: INestApplication;
  let redisClient: Redis.Redis;
  let chatService: ChatService;
  let apolloClient: ApolloClient<NormalizedCacheObject>;
  let wsLink: WebSocketLink;
  const apolloSubscriptions: any[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    redisClient = moduleFixture.get<RedisService>(RedisService).getClient();
    chatService = moduleFixture.get<ChatService>(ChatService);

    const apollo = await createApolloClient(app);
    apolloClient = apollo.apolloClinet;
    wsLink = apollo.wsLink;

    // clear database
    await getConnection().synchronize(true);
  });

  afterEach(() => {
    apolloSubscriptions.forEach((sub) => sub.unsubscribe());
  });

  afterAll(async () => {
    await disposeApolloClient(apolloClient, wsLink);
    await app.close();
  });

  beforeEach(async () => {
    await redisClient.flushall();
  });

  it('should enter the chat', async () => {
    const response = await apolloClient.mutate({
      mutation: gql`
        mutation {
          chatEnter(nickname: "${TEST_NICKNAME}")
        }
      `,
    });
    expect(response.data.chatEnter).toBe(true);

    expect(await chatService.listUsers()).toContain(TEST_NICKNAME);
  });

  it('should leave the chat', async () => {
    await chatService.enterChat(TEST_NICKNAME);

    const response = await apolloClient.mutate({
      mutation: gql`
        mutation {
          chatLeave(nickname: "${TEST_NICKNAME}")
        }
      `,
    });
    expect(response.data.chatLeave).toBe(true);

    expect(await chatService.listUsers()).not.toContain(TEST_NICKNAME);
  });

  it('should list all users in chat', async () => {
    await chatService.enterChat(TEST_NICKNAME);
    await chatService.enterChat(ANOTHER_TEST_NICKNAME);

    const response = await apolloClient.query({
      query: gql`
        query {
          chatListUsers
        }
      `,
    });
    expect(response.data.chatListUsers).toContain(TEST_NICKNAME);
    expect(response.data.chatListUsers).toContain(ANOTHER_TEST_NICKNAME);
  });

  it('should emit user entering chat', async (done) => {
    expect.assertions(1);

    apolloSubscriptions.push(
      apolloClient
        .subscribe({
          query: gql`
            subscription {
              chatUserEntered
            }
          `,
        })
        .subscribe({
          next: (res) => {
            expect(res.data.chatUserEntered).toBe(TEST_NICKNAME);
            done();
          },
          error: () => {
            done();
          },
        }),
    );

    await chatService.enterChat(TEST_NICKNAME);
  });

  it('should emit user leaving chat', async (done) => {
    expect.assertions(1);

    await chatService.enterChat(TEST_NICKNAME);

    apolloSubscriptions.push(
      apolloClient
        .subscribe({
          query: gql`
            subscription {
              chatUserLeaved
            }
          `,
        })
        .subscribe({
          next: (res) => {
            expect(res.data.chatUserLeaved).toBe(TEST_NICKNAME);
            done();
          },
          error: () => {
            done();
          },
        }),
    );

    await chatService.leaveChat(TEST_NICKNAME);
  });
});
