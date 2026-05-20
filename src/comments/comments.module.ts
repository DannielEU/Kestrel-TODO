import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsResolver } from './comments.resolver';
import { DrizzleModule } from 'src/database/drizzle.module';
import { PasetoModule } from 'src/auth/paseto/paseto.module';

@Module({
  imports: [DrizzleModule, PasetoModule],
  providers: [CommentsService, CommentsResolver],
})
export class CommentsModule {}
