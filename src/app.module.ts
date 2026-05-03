
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriverConfig } from '@nestjs/mercurius';
import { MercuriusDriver } from '@nestjs/mercurius';
import { UsersModule } from './users/users.module';
import { join } from 'path';
import { DrizzleModule } from './database/drizzle.module';
import { ConfigModule } from '@nestjs/config';
import { PasetoModule } from './auth/paseto/paseto.module';
import { WorksModule } from './works/works.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      graphiql: true,
      context: (req) => ({ req }),
    }),
    UsersModule,
    DrizzleModule,
    PasetoModule,
    WorksModule,
    WorkspacesModule,
    ProjectsModule,
  ],
})
export class AppModule {}

