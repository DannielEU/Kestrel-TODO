import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsResolver } from './projects.resolver';
import { DrizzleModule } from 'src/database/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [ProjectsResolver, ProjectsService],
})
export class ProjectsModule {}
