import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject, split } from '@apollo/client/core';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { INestApplication } from '@nestjs/common';
import fetch from 'cross-fetch';
import * as ws from 'ws';

export const createApolloClient = async (app: INestApplication) => {
  const address = app.getHttpServer().listen().address();

  const httpLink = new HttpLink({
    uri: `http://[${address.address}]:${address.port}/graphql`,
    fetch,
  });

  const wsLink = new WebSocketLink({
    uri: `ws://[${address.address}]:${address.port}/graphql`,
    options: {
      reconnect: true,
    },
    webSocketImpl: ws,
  });

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    httpLink,
  );

  return {
    apolloClinet: new ApolloClient({
      cache: new InMemoryCache(),
      link: splitLink,
    }),
    wsLink,
  };
};

export const disposeApolloClient = async (client: ApolloClient<NormalizedCacheObject>, wsLink: WebSocketLink) => {
  await client.clearStore();
  client.stop();
  (wsLink as any).subscriptionClient.close();
};
