import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CreateWorkspaceInput } from './dto/create-workspace.input';
import { AddMemberInput } from './dto/add-member.input';
import * as schema from '../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from 'src/database/drizzle.provider';
import { eq, and, inArray } from 'drizzle-orm';

type DB = NodePgDatabase<typeof schema>;

@Injectable()
export class WorkspacesService {
  logger = new Logger(WorkspacesService.name);

  constructor(@Inject(DRIZZLE) private db: DB) {}

  async create(input: CreateWorkspaceInput, userId: string) {
    const [workspace] = await this.db
      .insert(schema.workspaces)
      .values({ name: input.name })
      .returning();

    await this.db.insert(schema.workspaceUsers).values({
      workspaceId: workspace.id,
      userId,
      role: 'admin',
    });

    this.logger.log(`Workspace created: ${workspace.id}`);
    return workspace;
  }

  async update(id: string, name: string, userId: string) {
    await this.assertAdmin(id, userId);
    const [updated] = await this.db
      .update(schema.workspaces)
      .set({ name, updatedAt: new Date() })
      .where(eq(schema.workspaces.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Workspace ${id} not found`);
    return updated;
  }

  async remove(id: string, userId: string): Promise<boolean> {
    await this.assertAdmin(id, userId);
    await this.db
      .delete(schema.workspaceUsers)
      .where(eq(schema.workspaceUsers.workspaceId, id));
    const result = await this.db
      .delete(schema.workspaces)
      .where(eq(schema.workspaces.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async findAll(userId: string) {
    return this.db
      .select({
        id: schema.workspaces.id,
        name: schema.workspaces.name,
        createdAt: schema.workspaces.createdAt,
        role: schema.workspaceUsers.role,
        updatedAt: schema.workspaces.updatedAt,
      })
      .from(schema.workspaces)
      .innerJoin(
        schema.workspaceUsers,
        eq(schema.workspaces.id, schema.workspaceUsers.workspaceId),
      )
      .where(eq(schema.workspaceUsers.userId, userId));
  }

  async findOne(id: string, userId: string) {
    const [row] = await this.db
      .select({
        id: schema.workspaces.id,
        name: schema.workspaces.name,
        createdAt: schema.workspaces.createdAt,
        role: schema.workspaceUsers.role,
        updatedAt: schema.workspaces.updatedAt,
      })
      .from(schema.workspaces)
      .innerJoin(
        schema.workspaceUsers,
        eq(schema.workspaces.id, schema.workspaceUsers.workspaceId),
      )
      .where(
        and(
          eq(schema.workspaces.id, id),
          eq(schema.workspaceUsers.userId, userId),
        ),
      )
      .limit(1);

    if (!row) throw new NotFoundException(`Workspace ${id} not found`);

    const members = await this.findMembers(id);
    return { ...row, members };
  }

  async findMembers(workspaceId: string) {
    return this.db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        nickname: schema.users.nickname,
        email: schema.users.email,
        role: schema.workspaceUsers.role,
        joinedAt: schema.workspaceUsers.createdAt,
      })
      .from(schema.workspaceUsers)
      .innerJoin(schema.users, eq(schema.workspaceUsers.userId, schema.users.id))
      .where(eq(schema.workspaceUsers.workspaceId, workspaceId));
  }

  async addMember(input: AddMemberInput, requesterId: string) {
    await this.assertAdmin(input.workspaceId, requesterId);

    const [user] = await this.db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, input.email))
      .limit(1);

    if (!user) throw new NotFoundException(`User with email ${input.email} not found`);

    const [existing] = await this.db
      .select({ id: schema.workspaceUsers.id })
      .from(schema.workspaceUsers)
      .where(
        and(
          eq(schema.workspaceUsers.workspaceId, input.workspaceId),
          eq(schema.workspaceUsers.userId, user.id),
        ),
      )
      .limit(1);

    if (existing) throw new ConflictException('User is already a member of this workspace');

    await this.db.insert(schema.workspaceUsers).values({
      workspaceId: input.workspaceId,
      userId: user.id,
      role: 'member',
    });

    return true;
  }

  async removeMember(workspaceId: string, userId: string, requesterId: string): Promise<boolean> {
    await this.assertAdmin(workspaceId, requesterId);
    const result = await this.db
      .delete(schema.workspaceUsers)
      .where(
        and(
          eq(schema.workspaceUsers.workspaceId, workspaceId),
          eq(schema.workspaceUsers.userId, userId),
        ),
      );
    return (result.rowCount ?? 0) > 0;
  }

  async getStats(workspaceId: string) {
    const [projectRows, memberRows] = await Promise.all([
      this.db.select({ id: schema.projects.id }).from(schema.projects).where(eq(schema.projects.workspaceId, workspaceId)),
      this.db.select({ id: schema.workspaceUsers.id }).from(schema.workspaceUsers).where(eq(schema.workspaceUsers.workspaceId, workspaceId)),
    ]);

    const projectIds = projectRows.map(p => p.id);
    const allWorks = projectIds.length > 0
      ? await this.db.select({ state: schema.works.state }).from(schema.works).where(inArray(schema.works.projectId, projectIds))
      : [];

    const totalWorks = allWorks.length;
    const completedWorks = allWorks.filter(w => w.state === 'completed').length;
    const completionRate = totalWorks > 0 ? (completedWorks / totalWorks) * 100 : 0;

    return {
      totalProjects: projectRows.length,
      totalMembers: memberRows.length,
      totalWorks,
      completedWorks,
      completionRate,
    };
  }

  private async assertAdmin(workspaceId: string, userId: string) {
    const [row] = await this.db
      .select({ id: schema.workspaceUsers.id })
      .from(schema.workspaceUsers)
      .where(
        and(
          eq(schema.workspaceUsers.workspaceId, workspaceId),
          eq(schema.workspaceUsers.userId, userId),
          eq(schema.workspaceUsers.role, 'admin'),
        ),
      )
      .limit(1);

    if (!row) throw new ForbiddenException('Admin access required');
  }
}
