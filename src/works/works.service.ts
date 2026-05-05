import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateWorkInput } from './dto/create-work.input';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { DRIZZLE } from 'src/database/drizzle.provider';
import { eq } from 'drizzle-orm';

type DB = NodePgDatabase<typeof schema>;

@Injectable()
export class WorksService {
  
logger = new Logger(WorksService.name);
   constructor(
    @Inject(DRIZZLE) private db: DB
  ) {}

  async create(createWorkInput: CreateWorkInput, userId: string) {
    try{
    this.logger.log(`Creating work with input: ${JSON.stringify(createWorkInput)}`);
    const { state, description, level, projectId } = createWorkInput;
    const work = await this.db.insert(schema.works).values({
      state: state as (typeof schema.stateEnum.enumValues)[number],
      description,
      level: level as (typeof schema.levelEnum.enumValues)[number],
      projectId,
    }).returning();
    // auto asignar tarea a el creador.
    this.logger.log(`Work created with ID: ${work[0].id}, assigning to user ID: ${userId}`);
    await this.db.insert(schema.workUsers).values({
      userId,
      workId: work[0].id,
    });
    return work[0];
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error creating work: ${error.message}`);
      }
      throw error; 
    }
  }

async findAll(userId: string) {
  try {
    this.logger.log(`Fetching works for user ID: ${userId}`);

    const worksuser = await this.db
      .select({
        id: schema.works.id,
        state: schema.works.state,
        description: schema.works.description,
        level: schema.works.level,
        projectId: schema.works.projectId,
        createdAt: schema.works.createdAt,
        updatedAt: schema.works.updatedAt,
        name: schema.users.name,
        projectName: schema.projects.name,
        workspaceName: schema.workspaces.name,
      })
      .from(schema.workUsers)
      .innerJoin(
        schema.works,
        eq(schema.workUsers.workId, schema.works.id)
      )
      .innerJoin(
        schema.users,
        eq(schema.workUsers.userId, schema.users.id)
      )
      .innerJoin(
        schema.projects,
        eq(schema.works.projectId, schema.projects.id)
      )
      .innerJoin(
        schema.workspaces
      , eq(schema.projects.workspaceId, schema.workspaces.id)
      )
      .where(eq(schema.workUsers.userId, userId));

    return worksuser;

  } catch (error) {
    if (error instanceof Error) {
      this.logger.error(
        `Error fetching works for user ${userId}: ${error.message}`
      );
    }
    throw error;
  }
}
}
