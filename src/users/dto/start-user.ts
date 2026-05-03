import { InputType, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class StartUserInput {

  @IsEmail()
  @Field(() => String)
  email!: string;

  @Field(() => String)
  password!: string;

}