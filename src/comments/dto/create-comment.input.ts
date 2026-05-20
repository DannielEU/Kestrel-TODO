import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateCommentInput {
  @Field(() => ID) workId!: string;
  @Field() content!: string;
}
