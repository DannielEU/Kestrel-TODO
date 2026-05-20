import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class HistoryEntry {
  @Field(() => ID)
  id!: string;
  @Field(() => String)
  entityType!: string;
  @Field(() => ID)
  entityId!: string;
  @Field(() => ID, { nullable: true })
  userId!: string | null;
  @Field(() => String)
  action!: string;
  @Field(() => String, { nullable: true })
  field!: string | null;
  @Field(() => String, { nullable: true })
  oldValue!: string | null;
  @Field(() => String, { nullable: true })
  newValue!: string | null;
  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
}
