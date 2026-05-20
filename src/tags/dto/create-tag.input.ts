import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateTagInput {
  @Field() name!: string;
  @Field() color!: string;
  @Field(() => ID) workspaceId!: string;
}
