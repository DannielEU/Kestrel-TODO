import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import * as schema from '../database/schema';
import { DRIZZLE } from 'src/database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres/driver';
import { eq, and, inArray } from 'drizzle-orm';
import { HistoryService } from 'src/history/history.service';

type DB = NodePgDatabase<typeof schema>;

@Injectable()
export class ProjectsService {
  logger = new Logger(ProjectsService.name);

  constructor(
    @Inject(DRIZZLE) private db: DB,
    private historyService: HistoryService,
  ) {}

  async create(input: CreateProjectInput, userId: string) {
    if (!(await this.isWorkspaceMember(input.workspaceId, userId))) {
      throw new ForbiddenException('You are not a member of this workspace');
    }
    const [project] = await this.db
      .insert(schema.projects)
      .values({ name: input.name, description: input.description, workspaceId: input.workspaceId, createdBy: userId })
      .returning();
    await this.historyService.record(project.id, 'project', userId, 'create');
    this.logger.log(`Project created: ${project.id}`);
    return project;
  }

  async update(id: string, input: UpdateProjectInput, userId: string) {
    const project = await this.findOneById(id);
    if (!(await this.isWorkspaceMember(project.workspaceId!, userId))) {
      throw new ForbiddenException('Access denied');
    }
    const values: Partial<typeof schema.projects.$inferInsert> = {};
    if (input.name !== undefined) {
      await this.historyService.record(id, 'project', userId, 'update', 'name', project.name ?? undefined, input.name);
      values.name = input.name;
    }
    if (input.description !== undefined) {
      await this.historyService.record(id, 'project', userId, 'update', 'description', project.description ?? undefined, input.description);
      values.description = input.description;
    }
    const [updated] = await this.db
      .update(schema.projects)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(schema.projects.id, id))
      .returning();
    return updated;
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const project = await this.findOneById(id);
    if (!(await this.isWorkspaceAdmin(project.workspaceId!, userId))) {
      throw new ForbiddenException('Admin access required to delete a project');
    }
    await this.historyService.record(id, 'project', userId, 'delete');
    const result = await this.db.delete(schema.projects).where(eq(schema.projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async findAll(workspaceId: string, userId: string) {
    if (!(await this.isWorkspaceMember(workspaceId, userId))) {
      throw new ForbiddenException('You are not a member of this workspace');
    }
    return this.db.select().from(schema.projects).where(eq(schema.projects.workspaceId, workspaceId));
  }

  async findOne(id: string, userId: string) {
    const project = await this.findOneById(id);
    if (!(await this.isWorkspaceMember(project.workspaceId!, userId))) {
      throw new ForbiddenException('Access denied');
    }
    return project;
  }

  async getStats(projectId: string) {
    const allWorks = await this.db
      .select({ state: schema.works.state, points: schema.works.points })
      .from(schema.works)
      .where(eq(schema.works.projectId, projectId));

    const total = allWorks.length;
    const byState = {
      pending:    allWorks.filter(w => w.state === 'pending').length,
      inProgress: allWorks.filter(w => w.state === 'in_progress').length,
      completed:  allWorks.filter(w => w.state === 'completed').length,
      blocked:    allWorks.filter(w => w.state === 'blocked').length,
    };

    const worksWithPoints = allWorks.filter(w => w.points !== null);
    const avgPoints = worksWithPoints.length > 0
      ? worksWithPoints.reduce((s, w) => s + (w.points ?? 0), 0) / worksWithPoints.length
      : null;

    const workIds = (await this.db.select({ id: schema.works.id }).from(schema.works).where(eq(schema.works.projectId, projectId))).map(w => w.id);
    const assigneeCount = workIds.length > 0
      ? (await this.db
          .selectDistinct({ userId: schema.workUsers.userId })
          .from(schema.workUsers)
          .where(inArray(schema.workUsers.workId, workIds))).length
      : 0;

    return { total, byState, avgPoints, assigneeCount };
  }

  private async findOneById(id: string) {
    const [project] = await this.db.select().from(schema.projects).where(eq(schema.projects.id, id)).limit(1);
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  private async isWorkspaceMember(workspaceId: string, userId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: schema.workspaceUsers.id })
      .from(schema.workspaceUsers)
      .where(and(eq(schema.workspaceUsers.workspaceId, workspaceId), eq(schema.workspaceUsers.userId, userId)))
      .limit(1);
    return !!row;
  }

  private async isWorkspaceAdmin(workspaceId: string, userId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: schema.workspaceUsers.id })
      .from(schema.workspaceUsers)
      .where(and(
        eq(schema.workspaceUsers.workspaceId, workspaceId),
        eq(schema.workspaceUsers.userId, userId),
        eq(schema.workspaceUsers.role, 'admin'),
      ))
      .limit(1);
    return !!row;
  }
}
