import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class CommentAuthor {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() nickname!: string;
}

@ObjectType()
export class WorkComment {
  @Field(() => ID) id!: string;
  @Field(() => ID) workId!: string;
  @Field() content!: string;
  @Field(() => CommentAuthor) author!: CommentAuthor;
  @Field(() => GraphQLISODateTime) createdAt!: Date;
}
