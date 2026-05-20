import { InputType, Field, Int } from '@nestjs/graphql';
import { WorkState } from 'src/public/enums/workstate.enum';
import { Level } from 'src/public/enums/level.enum';

@InputType()
export class UpdateWorkInput {
  @Field(() => String, { nullable: true }) name?: string;
  @Field(() => WorkState, { nullable: true }) state?: WorkState;
  @Field(() => String, { nullable: true }) description?: string;
  @Field(() => Level, { nullable: true }) level?: Level;
  @Field(() => String, { nullable: true }) timeEstimate?: string;
  @Field(() => Int, { nullable: true }) points?: number;
}
