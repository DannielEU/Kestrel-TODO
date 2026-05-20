import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateProjectInput {
  @Field(() => String, { nullable: true })
  name?: string;
  @Field(() => String, { nullable: true })
  description?: string;
}
