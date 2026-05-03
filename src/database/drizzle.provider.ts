// src/database/drizzle.provider.ts
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';

export const DrizzleProvider = {
  provide: DRIZZLE,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const databaseUrl = configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL no está definido');
    }

    const pool = new Pool({
      connectionString: databaseUrl,
    });

    return drizzle(pool, { schema });
  },
};