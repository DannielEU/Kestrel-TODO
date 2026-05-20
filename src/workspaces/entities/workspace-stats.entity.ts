import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class WorkspaceStats {
  @Field(() => Int) totalProjects!: number;
  @Field(() => Int) totalMembers!: number;
  @Field(() => Int) totalWorks!: number;
  @Field(() => Int) completedWorks!: number;
  @Field(() => Float) completionRate!: number;
}
