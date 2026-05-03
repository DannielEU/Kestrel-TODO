import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  nickname!: string;
  
  @IsEmail()
  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field()
  lastname!: string;

  @Field()
  birthdate!: string;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
}

@ObjectType()
export class AuthUser {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field()
  nickname!: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  token!: string;

  @Field(() => AuthUser)
  user!: AuthUser;
}