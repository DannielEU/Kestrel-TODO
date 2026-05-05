import { ObjectType , Field, ID } from '@nestjs/graphql';

@ObjectType()
export class WorksUsers {
  @Field(() => ID)
  id: string;
  @Field(() => String)
  name: string;
  @Field(() => String)
  state: string;
  @Field(() => String)
  description: string;
  @Field(() => String)
  level: string;
  @Field(() => String)
  projectId: string;
  @Field(() => Date)
  createdAt: Date;
  @Field(() => Date)
  updatedAt: Date;
  @Field(() => String)
  projectName: string;
  @Field(() => String)
  workspaceName: string;
}