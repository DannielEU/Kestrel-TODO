import { Module } from '@nestjs/common';
import { WorksService } from './works.service';
import { WorksResolver } from './works.resolver';
import { DrizzleModule } from 'src/database/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [WorksResolver, WorksService],
})
export class WorksModule {}
