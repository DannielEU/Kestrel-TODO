import { ObjectType, Field, ID, Int, GraphQLISODateTime } from '@nestjs/graphql';
import { WorkState } from 'src/public/enums/workstate.enum';
import { Level } from 'src/public/enums/level.enum';

@ObjectType()
export class TagRef {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() color!: string;
}

@ObjectType()
export class Work {
  @Field(() => ID) id!: string;
  @Field(() => String) name!: string;
  @Field(() => WorkState) state!: WorkState;
  @Field(() => String, { nullable: true }) description!: string | null;
  @Field(() => Level) level!: Level;
  @Field(() => ID) projectId!: string;
  @Field(() => String, { nullable: true }) timeEstimate!: string | null;
  @Field(() => Int, { nullable: true }) points!: number | null;
  @Field(() => GraphQLISODateTime) createdAt!: Date;
  @Field(() => GraphQLISODateTime) updatedAt!: Date;
}

@ObjectType()
export class AssignedUser {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() nickname!: string;
  @Field(() => GraphQLISODateTime) assignedAt!: Date;
}

@ObjectType()
export class WorkWithAssignees {
  @Field(() => ID) id!: string;
  @Field(() => String) name!: string;
  @Field(() => WorkState) state!: WorkState;
  @Field(() => String, { nullable: true }) description!: string | null;
  @Field(() => Level) level!: Level;
  @Field(() => ID) projectId!: string;
  @Field(() => String, { nullable: true }) timeEstimate!: string | null;
  @Field(() => Int, { nullable: true }) points!: number | null;
  @Field(() => GraphQLISODateTime) createdAt!: Date;
  @Field(() => GraphQLISODateTime) updatedAt!: Date;
  @Field(() => [AssignedUser]) assignees!: AssignedUser[];
  @Field(() => [TagRef]) tags!: TagRef[];
}
