import { Inject, Injectable, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { DRIZZLE } from 'src/database/drizzle.provider';
import { eq, and, desc } from 'drizzle-orm';

type DB = NodePgDatabase<typeof schema>;

@Injectable()
export class HistoryService {
  logger = new Logger(HistoryService.name);

  constructor(@Inject(DRIZZLE) private db: DB) {}

  async findByEntity(entityId: string, entityType: 'project' | 'work') {
    return this.db
      .select()
      .from(schema.history)
      .where(
        and(
          eq(schema.history.entityId, entityId),
          eq(
            schema.history.entityType,
            entityType as (typeof schema.entityTypeEnum.enumValues)[number],
          ),
        ),
      )
      .orderBy(desc(schema.history.createdAt));
  }

  async record(
    entityId: string,
    entityType: 'project' | 'work',
    userId: string,
    action: 'create' | 'update' | 'delete' | 'assign' | 'unassign',
    field?: string,
    oldValue?: string,
    newValue?: string,
  ) {
    await this.db.insert(schema.history).values({
      entityId,
      entityType: entityType as (typeof schema.entityTypeEnum.enumValues)[number],
      userId,
      action: action as (typeof schema.actionEnum.enumValues)[number],
      field,
      oldValue,
      newValue,
    });
  }
}
