import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsResolver } from './tags.resolver';
import { DrizzleModule } from 'src/database/drizzle.module';
import { PasetoModule } from 'src/auth/paseto/paseto.module';

@Module({
  imports: [DrizzleModule, PasetoModule],
  providers: [TagsService, TagsResolver],
  exports: [TagsService],
})
export class TagsModule {}
