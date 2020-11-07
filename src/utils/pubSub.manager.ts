import { PubSub } from 'apollo-server-express';

const pubSub = new PubSub();

export const EVENT_SUB_CONNECTION_STATUS = 'SubConnectionStatus';
export const EVENT_CHAT_USER_ENTERED = 'chatUserEntered';
export const EVENT_CHAT_USER_LEAVED = 'chatUserLeaved';

type SubConnectionStatusPayload = {
  type: 'connected' | 'disconnected';
  payload: {
    user: string;
  };
};

export const subscribeToSubConnectionStatus = async (callback: (data: SubConnectionStatusPayload) => void) => {
  return pubSub.subscribe(EVENT_SUB_CONNECTION_STATUS, callback);
};

export const publishSubConnectionStatus = async (data: SubConnectionStatusPayload) => {
  return pubSub.publish(EVENT_SUB_CONNECTION_STATUS, data);
};

export const publishUserEnteredChat = async (user: string) => {
  return pubSub.publish(EVENT_CHAT_USER_ENTERED, {
    [EVENT_CHAT_USER_ENTERED]: user,
  });
};

export const publishUserLeavedChat = async (user: string) => {
  return pubSub.publish(EVENT_CHAT_USER_LEAVED, {
    [EVENT_CHAT_USER_LEAVED]: user,
  });
};

export const getAsyncIterator = (type: string) => {
  return pubSub.asyncIterator(type);
};
