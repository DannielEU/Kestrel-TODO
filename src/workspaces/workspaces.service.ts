import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateWorkspaceInput } from './dto/create-workspace.input';
import * as schema from '../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from 'src/database/drizzle.provider';
import { eq } from 'drizzle-orm';

type DB = NodePgDatabase<typeof schema>;

@Injectable()
export class WorkspacesService {

  logger = new Logger(WorkspacesService.name);
     constructor(
      @Inject(DRIZZLE) private db: DB,
    ) {}


  async create(createWorkspaceInput: CreateWorkspaceInput, userId: string) {
    try {
      const { name } = createWorkspaceInput;
      
      const result = await this.db
        .insert(schema.workspaces)
        .values({ name })
        .returning();

      const workspace = result[0];

      await this.db.insert(schema.workspaceUsers).values({
        workspaceId: workspace.id,
        userId: userId,
        role: 'admin',
      });

      this.logger.log(`Workspace created: ${name} with id ${workspace.id} by user ${userId}`);

      return result[0]; 

    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error creating workspace: ${error.message}`);
      }
      throw error; 
    }
}


 async findAll(userId: string) {
  const workspacesuser = await this.db
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
    eq(schema.workspaces.id, schema.workspaceUsers.workspaceId)
  )
  .where(eq(schema.workspaceUsers.userId, userId));

  this.logger.log(`Fetched workspaces for user ${userId}: ${workspacesuser.length} found`);

  return workspacesuser;
}


  // pendiente por probar

  findOne(id: number, userId:string ) {
    this.logger.log(`Fetching workspace with id ${id} for user ${userId}`);
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
        eq(schema.workspaces.id, schema.workspaceUsers.workspaceId)
      )
      .where( 
        eq(schema.workspaces.id, schema.workspaceUsers.workspaceId) &&
        eq(schema.workspaceUsers.userId, userId)
      )
      .then(results => {
        if (results.length === 0) {
          this.logger.warn(`Workspace with id ${id} not found for user ${userId}`);
          return null; 
        }
        this.logger.log(`Workspace with id ${id} found for user ${userId}`);
        return results[0]; 
      });
  }

  remove(id: number) {
    return `This action removes a #${id} workspace`;
  }
}
