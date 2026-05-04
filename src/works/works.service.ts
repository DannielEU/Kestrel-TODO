import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateWorkInput } from './dto/create-work.input';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { DRIZZLE } from 'src/database/drizzle.provider';

type DB = NodePgDatabase<typeof schema>;

@Injectable()
export class WorksService {
  
logger = new Logger(WorksService.name);
   constructor(
    @Inject(DRIZZLE) private db: DB
  ) {}

  async create(createWorkInput: CreateWorkInput, userId: string) {
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
  }

  findAll() {
    return `This action returns all works`;
  }
}
