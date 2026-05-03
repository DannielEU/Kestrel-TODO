import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { DrizzleModule } from 'src/database/drizzle.module';
import { PasetoModule } from 'src/auth/paseto/paseto.module';

@Module({
  imports: [DrizzleModule, PasetoModule],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
