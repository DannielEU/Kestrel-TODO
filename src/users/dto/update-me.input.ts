import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateMeInput {
  @Field(() => String, { nullable: true })
  name?: string;
  @Field(() => String, { nullable: true })
  lastname?: string;
  @Field(() => String, { nullable: true })
  nickname?: string;
}
