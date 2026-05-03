import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { WorkState } from 'src/public/enums/workstate.enum';
import { Level } from 'src/public/enums/level.enum';
import { GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class Work {
  @Field(() => ID)
  id: string;
  @Field(() => WorkState)
  state: WorkState;
  @Field(() => String)
  description: string;
  @Field(() => Level)
  level: Level;
  @Field(() => ID)
  projectId:string
  @Field(() => GraphQLISODateTime)
  createdAt: Date;
  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
