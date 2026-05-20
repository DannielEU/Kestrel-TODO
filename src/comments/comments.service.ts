import { Inject, Injectable, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { DRIZZLE } from 'src/database/drizzle.provider';
import { eq, asc } from 'drizzle-orm';
import { CreateCommentInput } from './dto/create-comment.input';

type DB = NodePgDatabase<typeof schema>;

@Injectable()
export class CommentsService {
  logger = new Logger(CommentsService.name);

  constructor(@Inject(DRIZZLE) private db: DB) {}

  async create(input: CreateCommentInput, userId: string) {
    const [comment] = await this.db
      .insert(schema.workComments)
      .values({ workId: input.workId, userId, content: input.content })
      .returning();
    this.logger.log(`Comment created on work ${input.workId}`);

    const author = await this.db
      .select({ id: schema.users.id, name: schema.users.name, nickname: schema.users.nickname })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    return { ...comment, author: author[0] ?? { id: userId, name: '', nickname: '' } };
  }

  async findByWork(workId: string) {
    const rows = await this.db
      .select({
        id: schema.workComments.id,
        workId: schema.workComments.workId,
        content: schema.workComments.content,
        createdAt: schema.workComments.createdAt,
        authorId: schema.users.id,
        authorName: schema.users.name,
        authorNickname: schema.users.nickname,
      })
      .from(schema.workComments)
      .leftJoin(schema.users, eq(schema.workComments.userId, schema.users.id))
      .where(eq(schema.workComments.workId, workId))
      .orderBy(asc(schema.workComments.createdAt));

    return rows.map(r => ({
      id: r.id,
      workId: r.workId,
      content: r.content,
      createdAt: r.createdAt,
      author: { id: r.authorId ?? '', name: r.authorName ?? '', nickname: r.authorNickname ?? '' },
    }));
  }
}
