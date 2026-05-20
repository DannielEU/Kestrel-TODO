import { Module } from '@nestjs/common';
import { WorksService } from './works.service';
import { WorksResolver } from './works.resolver';
import { DrizzleModule } from 'src/database/drizzle.module';
import { PasetoModule } from 'src/auth/paseto/paseto.module';
import { HistoryModule } from 'src/history/history.module';
import { TagsModule } from 'src/tags/tags.module';

@Module({
  imports: [DrizzleModule, PasetoModule, HistoryModule, TagsModule],
  providers: [WorksResolver, WorksService],
})
export class WorksModule {}
