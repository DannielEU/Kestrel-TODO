import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateWorkInput } from './dto/create-work.input';
import { UpdateWorkInput } from './dto/update-work.input';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { DRIZZLE } from 'src/database/drizzle.provider';
import { eq, and, inArray } from 'drizzle-orm';
import { HistoryService } from 'src/history/history.service';
import { TagsService } from 'src/tags/tags.service';

type DB = NodePgDatabase<typeof schema>;

@Injectable()
export class WorksService {
  logger = new Logger(WorksService.name);

  constructor(
    @Inject(DRIZZLE) private db: DB,
    private historyService: HistoryService,
    private tagsService: TagsService,
  ) {}

  async create(createWorkInput: CreateWorkInput, userId: string) {
    const { name, state, description, level, projectId, timeEstimate, points } = createWorkInput;
    const [work] = await this.db
      .insert(schema.works)
      .values({
        name,
        state: state as (typeof schema.stateEnum.enumValues)[number],
        description,
        level: level as (typeof schema.levelEnum.enumValues)[number],
        projectId,
        timeEstimate,
        points,
      })
      .returning();

    await this.db.insert(schema.workUsers).values({ userId, workId: work.id });
    await this.historyService.record(work.id, 'work', userId, 'create');
    this.logger.log(`Work created: ${work.id}`);
    return work;
  }

  async update(id: string, updateWorkInput: UpdateWorkInput, userId: string) {
    await this.assertAssigned(id, userId);
    const existing = await this.findOneById(id);
    const { name, state, description, level, timeEstimate, points } = updateWorkInput;
    const values: Partial<typeof schema.works.$inferInsert> = {};

    if (name !== undefined) {
      await this.historyService.record(id, 'work', userId, 'update', 'name', existing.name ?? undefined, name);
      values.name = name;
    }
    if (description !== undefined) {
      await this.historyService.record(id, 'work', userId, 'update', 'description', existing.description ?? undefined, description);
      values.description = description;
    }
    if (state !== undefined) {
      await this.historyService.record(id, 'work', userId, 'update', 'state', existing.state ?? undefined, state);
      values.state = state as (typeof schema.stateEnum.enumValues)[number];
    }
    if (level !== undefined) {
      await this.historyService.record(id, 'work', userId, 'update', 'level', existing.level ?? undefined, level);
      values.level = level as (typeof schema.levelEnum.enumValues)[number];
    }
    if (timeEstimate !== undefined) {
      await this.historyService.record(id, 'work', userId, 'update', 'timeEstimate', existing.timeEstimate ?? undefined, timeEstimate);
      values.timeEstimate = timeEstimate;
    }
    if (points !== undefined) {
      await this.historyService.record(id, 'work', userId, 'update', 'points', String(existing.points ?? ''), String(points));
      values.points = points;
    }

    const [updated] = await this.db
      .update(schema.works)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(schema.works.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Work ${id} not found`);
    return updated;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await this.assertAssigned(id, userId);
    await this.historyService.record(id, 'work', userId, 'delete');
    await this.db.delete(schema.workUsers).where(eq(schema.workUsers.workId, id));
    const result = await this.db.delete(schema.works).where(eq(schema.works.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async findAll(userId: string) {
    const rows = await this.db
      .select({
        id: schema.works.id,
        name: schema.works.name,
        state: schema.works.state,
        description: schema.works.description,
        level: schema.works.level,
        projectId: schema.works.projectId,
        createdAt: schema.works.createdAt,
        updatedAt: schema.works.updatedAt,
        assignedUserName: schema.users.name,
        projectName: schema.projects.name,
        workspaceName: schema.workspaces.name,
      })
      .from(schema.workUsers)
      .innerJoin(schema.works, eq(schema.workUsers.workId, schema.works.id))
      .innerJoin(schema.users, eq(schema.workUsers.userId, schema.users.id))
      .innerJoin(schema.projects, eq(schema.works.projectId, schema.projects.id))
      .innerJoin(schema.workspaces, eq(schema.projects.workspaceId, schema.workspaces.id))
      .where(eq(schema.workUsers.userId, userId));
    return rows;
  }

  async findByProject(projectId: string) {
    const works = await this.db
      .select()
      .from(schema.works)
      .where(eq(schema.works.projectId, projectId));

    if (works.length === 0) return [];
    const workIds = works.map(w => w.id);

    const [assigneeRows, tagRows] = await Promise.all([
      this.db
        .select({
          workId: schema.workUsers.workId,
          id: schema.users.id,
          name: schema.users.name,
          nickname: schema.users.nickname,
          assignedAt: schema.workUsers.assignedAt,
        })
        .from(schema.workUsers)
        .innerJoin(schema.users, eq(schema.workUsers.userId, schema.users.id))
        .where(inArray(schema.workUsers.workId, workIds)),
      this.tagsService.findTagsByWorkIds(workIds),
    ]);

    const assigneeMap = new Map<string, typeof assigneeRows>();
    const tagMap = new Map<string, typeof tagRows>();
    for (const a of assigneeRows) {
      if (!assigneeMap.has(a.workId!)) assigneeMap.set(a.workId!, []);
      assigneeMap.get(a.workId!)!.push(a);
    }
    for (const t of tagRows) {
      if (!tagMap.has(t.workId!)) tagMap.set(t.workId!, []);
      tagMap.get(t.workId!)!.push(t);
    }

    return works.map(w => ({
      ...w,
      assignees: assigneeMap.get(w.id) ?? [],
      tags: (tagMap.get(w.id) ?? []).map(t => ({ id: t.id, name: t.name, color: t.color, workspaceId: t.workspaceId })),
    }));
  }

  async assignUser(workId: string, userId: string): Promise<boolean> {
    await this.db.insert(schema.workUsers).values({ workId, userId }).onConflictDoNothing();
    await this.historyService.record(workId, 'work', userId, 'assign');
    return true;
  }

  async unassignUser(workId: string, userId: string): Promise<boolean> {
    await this.historyService.record(workId, 'work', userId, 'unassign');
    const result = await this.db
      .delete(schema.workUsers)
      .where(and(eq(schema.workUsers.workId, workId), eq(schema.workUsers.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  private async findOneById(id: string) {
    const [work] = await this.db.select().from(schema.works).where(eq(schema.works.id, id)).limit(1);
    if (!work) throw new NotFoundException(`Work ${id} not found`);
    return work;
  }

  private async assertAssigned(workId: string, userId: string) {
    const [row] = await this.db
      .select({ id: schema.workUsers.id })
      .from(schema.workUsers)
      .where(and(eq(schema.workUsers.workId, workId), eq(schema.workUsers.userId, userId)))
      .limit(1);
    if (!row) throw new ForbiddenException('You are not assigned to this work');
  }
}
