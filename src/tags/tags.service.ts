import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { DRIZZLE } from 'src/database/drizzle.provider';
import { eq, and, inArray } from 'drizzle-orm';
import { CreateTagInput } from './dto/create-tag.input';

type DB = NodePgDatabase<typeof schema>;

@Injectable()
export class TagsService {
  logger = new Logger(TagsService.name);

  constructor(@Inject(DRIZZLE) private db: DB) {}

  async findByWorkspace(workspaceId: string) {
    return this.db
      .select()
      .from(schema.tags)
      .where(eq(schema.tags.workspaceId, workspaceId));
  }

  async create(input: CreateTagInput, userId: string) {
    await this.assertMember(input.workspaceId, userId);
    const [tag] = await this.db
      .insert(schema.tags)
      .values({ name: input.name, color: input.color, workspaceId: input.workspaceId })
      .returning();
    this.logger.log(`Tag created: ${tag.id}`);
    return tag;
  }

  async delete(tagId: string, userId: string): Promise<boolean> {
    const [tag] = await this.db
      .select({ workspaceId: schema.tags.workspaceId })
      .from(schema.tags)
      .where(eq(schema.tags.id, tagId))
      .limit(1);
    if (!tag) throw new NotFoundException(`Tag ${tagId} not found`);
    await this.assertMember(tag.workspaceId!, userId);
    const result = await this.db.delete(schema.tags).where(eq(schema.tags.id, tagId));
    return (result.rowCount ?? 0) > 0;
  }

  async addToWork(workId: string, tagId: string): Promise<boolean> {
    await this.db
      .insert(schema.workTags)
      .values({ workId, tagId })
      .onConflictDoNothing();
    return true;
  }

  async removeFromWork(workId: string, tagId: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.workTags)
      .where(and(eq(schema.workTags.workId, workId), eq(schema.workTags.tagId, tagId)));
    return (result.rowCount ?? 0) > 0;
  }

  async findTagsByWorkIds(workIds: string[]) {
    if (workIds.length === 0) return [];
    return this.db
      .select({
        workId: schema.workTags.workId,
        id: schema.tags.id,
        name: schema.tags.name,
        color: schema.tags.color,
        workspaceId: schema.tags.workspaceId,
      })
      .from(schema.workTags)
      .innerJoin(schema.tags, eq(schema.workTags.tagId, schema.tags.id))
      .where(inArray(schema.workTags.workId, workIds));
  }

  private async assertMember(workspaceId: string, userId: string) {
    const [row] = await this.db
      .select({ id: schema.workspaceUsers.id })
      .from(schema.workspaceUsers)
      .where(
        and(
          eq(schema.workspaceUsers.workspaceId, workspaceId),
          eq(schema.workspaceUsers.userId, userId),
        ),
      )
      .limit(1);
    if (!row) throw new ForbiddenException('Not a workspace member');
  }
}
