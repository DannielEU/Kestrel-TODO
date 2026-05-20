import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class StateBreakdown {
  @Field(() => Int) pending!: number;
  @Field(() => Int) inProgress!: number;
  @Field(() => Int) completed!: number;
  @Field(() => Int) blocked!: number;
}

@ObjectType()
export class ProjectStats {
  @Field(() => Int) total!: number;
  @Field(() => StateBreakdown) byState!: StateBreakdown;
  @Field(() => Float, { nullable: true }) avgPoints!: number | null;
  @Field(() => Int) assigneeCount!: number;
}
