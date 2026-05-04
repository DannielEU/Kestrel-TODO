import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateProjectInput } from './dto/create-project.input';
import * as schema from '../database/schema';
import { DRIZZLE } from 'src/database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres/driver';
import { eq, and } from 'drizzle-orm';


type DB = NodePgDatabase<typeof schema>;

@Injectable()
export class ProjectsService {

  logger = new Logger(ProjectsService.name);
     constructor(
      @Inject(DRIZZLE) private db: DB,
    ) {}

  async create(createProjectInput: CreateProjectInput, userId: string) {
    this.logger.log('Creating a new project');
    const { name, description, workspaceId } = createProjectInput;
    // verificar que el usuario tenga acceso al workspace siendo admin
    
    if (!(await this.verifyUserAccess(workspaceId, userId))) {
      throw new Error('Unauthorized');  
    }
    const project = await this.db.insert(schema.projects).values({
      name,
      description,
      workspaceId,
    }).returning();
    return project[0];
  }

  async verifyUserAccess(workspaceId: string, userId: string): Promise<boolean> {
  const access = await this.db
    .select({ id: schema.workspaceUsers.id })
    .from(schema.workspaceUsers)
    .where(
      and(
        eq(schema.workspaceUsers.workspaceId, workspaceId),
        eq(schema.workspaceUsers.userId, userId),
        eq(schema.workspaceUsers.role, 'admin')
      )
    )
    .limit(1);

  return access.length > 0;
  }

  // get all projects for a workspace
  async findAll(workspaceId: string) {
    this.logger.log(`Fetching all projects for workspace ${workspaceId}`);
    return await this.db.select().from(schema.projects).where(eq(schema.projects.workspaceId, workspaceId));
  }
}
