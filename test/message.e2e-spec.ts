import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core';
import { WebSocketLink } from '@apollo/client/link/ws';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { gql } from 'apollo-server-express';
import * as Redis from 'ioredis';
import { RedisService } from 'nestjs-redis';
import { getConnection } from 'typeorm';
import { MessageService } from '../src/message/message.service';
import { AppModule } from '../src/app.module';
import { ChatService } from '../src/chat/chat.service';
import { createApolloClient, disposeApolloClient } from './testUtils';

const TEST_NICKNAME = 'fulano';
const ANOTHER_TEST_NICKNAME = 'fulano2';
const TEST_CONTENT = 'content';

describe('Message Module', () => {
  let app: INestApplication;
  let redisClient: Redis.Redis;
  let chatService: ChatService;
  let messageService: MessageService;
  let apolloClient: ApolloClient<NormalizedCacheObject>;
  let wsLink: WebSocketLink;
  const apolloSubscriptions: any[] = [];

  beforeAll(async () => {
    // initialize nestjs application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    redisClient = moduleFixture.get<RedisService>(RedisService).getClient();
    chatService = moduleFixture.get<ChatService>(ChatService);
    messageService = moduleFixture.get<MessageService>(MessageService);

    const apollo = await createApolloClient(app);
    apolloClient = apollo.apolloClinet;
    wsLink = apollo.wsLink;
  });

  afterEach(() => {
    apolloSubscriptions.forEach((sub) => sub.unsubscribe());
  });

  afterAll(async () => {
    await disposeApolloClient(apolloClient, wsLink);

    // the app needs to be closed last
    await app.close();
  });

  beforeEach(async () => {
    // clear redis keys
    await redisClient.flushall();
    // clear database
    await getConnection().synchronize(true);
  });

  it('should send message', async () => {
    await chatService.enterChat(TEST_NICKNAME);

    const response = await apolloClient.mutate({
      mutation: gql`
        mutation {
          messageSend(nickname: "${TEST_NICKNAME}", content: "${TEST_CONTENT}") {
            id
            content
            createdBy
          }
        }
      `,
    });

    // the response should contain the given data
    expect(response.data.messageSend).toMatchObject({
      content: TEST_CONTENT,
      createdBy: TEST_NICKNAME,
    });

    // it should have one the message created above
    const messages = await messageService.listMessages();
    expect(messages).toHaveLength(1);
    expect(messages).toContainEqual(
      expect.objectContaining({
        content: TEST_CONTENT,
        createdBy: TEST_NICKNAME,
      }),
    );
  });

  it('should throw error to send message befor entering the chat', async () => {
    expect.assertions(3);

    try {
      await apolloClient.mutate({
        mutation: gql`
          mutation {
            messageSend(nickname: "${TEST_NICKNAME}", content: "${TEST_CONTENT}") {
              id
              content
              createdBy
            }
          }
        `,
      });
    } catch (error) {
      expect(error.graphQLErrors[0].extensions.exception.response.statusCode).toBe(400);
      expect(error.message).toBe('Please enter the chat before sending any messages!');
    }

    const messages = await messageService.listMessages();
    expect(messages).toHaveLength(0);
  });

  it('should list messages', async () => {
    await chatService.enterChat(TEST_NICKNAME);
    await messageService.sendMessage(TEST_CONTENT, TEST_NICKNAME);

    await chatService.enterChat(ANOTHER_TEST_NICKNAME);
    await messageService.sendMessage(TEST_CONTENT, ANOTHER_TEST_NICKNAME);

    const response = await apolloClient.query({
      query: gql`
        query {
          messages {
            id
            content
            createdBy
            createdAt
          }
        }
      `,
    });

    // it should return exactly the two messages created above
    expect(response.data.messages).toHaveLength(2);
    expect(response.data.messages).toContainEqual(
      expect.objectContaining({
        content: TEST_CONTENT,
        createdBy: TEST_NICKNAME,
      }),
    );
    expect(response.data.messages).toContainEqual(
      expect.objectContaining({
        content: TEST_CONTENT,
        createdBy: ANOTHER_TEST_NICKNAME,
      }),
    );
  });

  it('should emit new message', async (done) => {
    expect.assertions(1);

    apolloSubscriptions.push(
      apolloClient
        .subscribe({
          query: gql`
            subscription {
              messageSent {
                id
                content
                createdBy
                createdAt
              }
            }
          `,
        })
        .subscribe({
          next: (res) => {
            expect(res.data.messageSent).toMatchObject({
              content: TEST_CONTENT,
              createdBy: TEST_NICKNAME,
            });
            done();
          },
          error: () => {
            done();
          },
        }),
    );

    await chatService.enterChat(TEST_NICKNAME);
    await messageService.sendMessage(TEST_CONTENT, TEST_NICKNAME);
  });
});
