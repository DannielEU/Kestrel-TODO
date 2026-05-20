import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryResolver } from './history.resolver';
import { DrizzleModule } from 'src/database/drizzle.module';
import { PasetoModule } from 'src/auth/paseto/paseto.module';

@Module({
  imports: [DrizzleModule, PasetoModule],
  providers: [HistoryService, HistoryResolver],
  exports: [HistoryService],
})
export class HistoryModule {}
