import { Field, ID, InputType } from '@nestjs/graphql';
import{ GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class CreateProjectInput {

  @Field(() => String)
  name!: string;

  @Field(() => String)
  description!: string;
  
  @Field(() => ID)
  workspaceId!: string;
  
  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
  
  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}

