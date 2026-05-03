import { InputType, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  nickname!: string;

  @IsEmail()
  @Field(() => String)
  email!: string;

  @Field(() => String)
  password!: string;

  @Field(() => String)
  lastname!: string;

  @Field(() => String)
  birthdate!: string;
}