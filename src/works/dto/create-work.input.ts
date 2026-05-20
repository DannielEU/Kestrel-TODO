import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { WorkState } from 'src/public/enums/workstate.enum';
import { Level } from 'src/public/enums/level.enum';

@InputType()
export class CreateWorkInput {
  @Field(() => String) name!: string;
  @Field(() => WorkState, { defaultValue: WorkState.PENDING }) state!: WorkState;
  @Field(() => String, { nullable: true }) description?: string;
  @Field(() => Level, { defaultValue: Level.Medium }) level!: Level;
  @Field(() => ID) projectId!: string;
  @Field(() => String, { nullable: true }) timeEstimate?: string;
  @Field(() => Int, { nullable: true }) points?: number;
}
