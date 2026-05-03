import { InputType, Field, ID } from '@nestjs/graphql';
import { WorkState } from 'src/public/enums/workstate.enum';
import { Level } from 'src/public/enums/level.enum';

@InputType()
export class CreateWorkInput {
  @Field(() => WorkState)
  state: WorkState;
  @Field(() => String)
  description: string;
  @Field(() => Level)
  level: Level;
  @Field(() => ID)
  projectId:string

}
