import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsResolver } from './projects.resolver';
import { DrizzleModule } from 'src/database/drizzle.module';
import { PasetoModule } from 'src/auth/paseto/paseto.module';

@Module({
  imports: [DrizzleModule, PasetoModule],
  providers: [ProjectsResolver, ProjectsService],
})
export class ProjectsModule {}
