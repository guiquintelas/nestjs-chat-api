import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ConnectionType {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

registerEnumType(ConnectionType, {
  name: 'ConnectionType',
});

@ObjectType()
export class ChatUserChangedOnlineStatus {
  @Field(() => ConnectionType)
  type: ConnectionType;

  @Field()
  user: string;
}
