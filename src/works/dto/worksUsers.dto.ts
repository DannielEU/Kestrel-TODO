import { ObjectType, Field, ID } from '@nestjs/graphql';
import { WorkState } from 'src/public/enums/workstate.enum';
import { Level } from 'src/public/enums/level.enum';

@ObjectType()
export class WorksUsers {
  @Field(() => ID)
  id!: string;
  @Field(() => String)
  name!: string;
  @Field(() => WorkState)
  state!: WorkState;
  @Field(() => String, { nullable: true })
  description!: string | null;
  @Field(() => Level)
  level!: Level;
  @Field(() => String)
  projectId!: string;
  @Field(() => Date)
  createdAt!: Date;
  @Field(() => Date)
  updatedAt!: Date;
  @Field(() => String)
  assignedUserName!: string;
  @Field(() => String)
  projectName!: string;
  @Field(() => String)
  workspaceName!: string;
}
