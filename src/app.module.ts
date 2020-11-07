import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'nestjs-redis';
import { AppController } from './app.controller';
import { MessageModule } from './message/message.module';
import { ChatModule } from './chat/chat.module';
import { publishUserChangedOnlineStatus } from './utils/pubSub.manager';
import { ConnectionType } from './chat/dtos/chatUserChangedOnlineStatus.dto';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql',
      subscriptions: {
        // necessary to populate `initPromise`
        // in the onDisconnect function bellow
        // with the connectionParams set by the client
        onConnect: async (params: any) => {
          if (!params?.user) {
            return undefined;
          }

          return params;
        },

        // handles WebSocket disconnects
        // Eg. user closed the window
        onDisconnect: async (ws, ctx) => {
          if (!ctx.initPromise) {
            return;
          }

          const resolvedConnectPromise = await ctx.initPromise;

          if (!resolvedConnectPromise?.user) {
            return;
          }

          await publishUserChangedOnlineStatus({
            type: ConnectionType.DISCONNECTED,
            user: resolvedConnectPromise.user,
          });
        },
      },

      // builds the GraphQl Resolver context
      // it's used in the Resolvers to retrieve the context
      // via @Context decorator
      context: async ({ connection }) => {
        if (!connection) {
          return undefined;
        }

        if (!connection?.context?.user) {
          return undefined;
        }

        return {
          payload: connection?.context,
        };
      },
    }),
    RedisModule.register({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    }),
    MessageModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
