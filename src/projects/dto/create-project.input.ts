import { Field, ID, InputType } from '@nestjs/graphql';


@InputType()
export class CreateProjectInput {

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description?: string;
  
  @Field(() => ID)
  workspaceId!: string;
  
}

