import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import{ GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class Project {
  @Field(() => ID)
  id!: string;
  @Field(() => String)
  name!: string;
  @Field(() => String)
  description!: string;
  @Field(() => ID)
  workspaceId!: string;
  @Field(() => ID)
  createdBy!: string;
  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
