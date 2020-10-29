import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectID } from 'mongodb';
import { Column, CreateDateColumn, Entity, ObjectIdColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Message {
  @Field(() => String)
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  content: string;

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
