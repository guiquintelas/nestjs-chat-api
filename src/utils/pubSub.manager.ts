import { PubSub } from 'apollo-server-express';
import { ChatUserChangedOnlineStatus } from '../chat/dtos/chatUserChangedOnlineStatus.dto';
import { Message } from '../message/message.entity';

const pubSub = new PubSub();

export const EVENT_CHAT_USER_ENTERED = 'chatUserEntered';
export const EVENT_CHAT_USER_LEAVED = 'chatUserLeaved';
export const EVENT_CHAT_USER_CHANGED_ONLINE_STATUS = 'chatUserChangedOnlineStatus';
export const EVENT_MESSAGE_SENT = 'messageSent';

export const getAsyncIterator = (type: string) => {
  return pubSub.asyncIterator(type);
};

export const subscribeToUserChangedOnlineStatus = async (callback: (payload: ChatUserChangedOnlineStatus) => void) => {
  return pubSub.subscribe(EVENT_CHAT_USER_CHANGED_ONLINE_STATUS, (data) =>
    callback(data[EVENT_CHAT_USER_CHANGED_ONLINE_STATUS]),
  );
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

export const publishUserChangedOnlineStatus = async (payload: ChatUserChangedOnlineStatus) => {
  return pubSub.publish(EVENT_CHAT_USER_CHANGED_ONLINE_STATUS, {
    [EVENT_CHAT_USER_CHANGED_ONLINE_STATUS]: payload,
  });
};

export const publishMessageSent = async (msg: Message) => {
  return pubSub.publish(EVENT_MESSAGE_SENT, {
    [EVENT_MESSAGE_SENT]: msg,
  });
};
