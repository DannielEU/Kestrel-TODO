import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesResolver } from './workspaces.resolver';
import { PasetoModule } from 'src/auth/paseto/paseto.module';
import { DrizzleModule } from 'src/database/drizzle.module';

@Module({
  imports: [DrizzleModule, PasetoModule],
  providers: [WorkspacesResolver, WorkspacesService],
})
export class WorkspacesModule {}
