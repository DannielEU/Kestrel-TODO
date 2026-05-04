import { Module } from '@nestjs/common';
import { WorksService } from './works.service';
import { WorksResolver } from './works.resolver';
import { DrizzleModule } from 'src/database/drizzle.module';
import { PasetoModule } from 'src/auth/paseto/paseto.module';

@Module({
  imports: [DrizzleModule, PasetoModule],
  providers: [WorksResolver, WorksService],
})
export class WorksModule {}
