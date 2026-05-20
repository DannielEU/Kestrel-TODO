import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class Tag {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() color!: string;
  @Field(() => ID) workspaceId!: string;
  @Field(() => GraphQLISODateTime) createdAt!: Date;
}
