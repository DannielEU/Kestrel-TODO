import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class AddMemberInput {
  @Field(() => ID)
  workspaceId: string;
  @Field(() => String)
  email: string;
}
