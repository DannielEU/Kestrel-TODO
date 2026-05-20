import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class Workspace {
  @Field(() => ID)
  id!: string;
  @Field()
  name!: string;
  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}

@ObjectType()
export class WorkspaceUser {
  @Field(() => ID)
  id!: string;
  @Field(() => String)
  role!: string;
  @Field()
  name!: string;
  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}

@ObjectType()
export class WorkspaceMember {
  @Field(() => ID)
  id!: string;
  @Field()
  name!: string;
  @Field()
  nickname!: string;
  @Field()
  email!: string;
  @Field(() => String)
  role!: string;
  @Field(() => GraphQLISODateTime)
  joinedAt!: Date;
}

@ObjectType()
export class WorkspaceDetail {
  @Field(() => ID)
  id!: string;
  @Field()
  name!: string;
  @Field(() => String)
  role!: string;
  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
  @Field(() => [WorkspaceMember])
  members!: WorkspaceMember[];
}
