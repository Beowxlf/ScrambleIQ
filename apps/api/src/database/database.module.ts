import { Module } from '@nestjs/common';

import { DATABASE_CLIENT } from './database.tokens';
import { DatabaseMigrationService } from './database.migrations';
import { PsqlClient } from './database.client';

@Module({
  providers: [
    {
      provide: DATABASE_CLIENT,
      useFactory: () => {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
          return null;
        }

        return new PsqlClient(databaseUrl);
      },
    },
    {
      provide: DatabaseMigrationService,
      useFactory: async (client: PsqlClient | null) => {
        if (!client) {
          return null;
        }

        const service = new DatabaseMigrationService(client);
        await service.onModuleInit();
        return service;
      },
      inject: [DATABASE_CLIENT],
    },
  ],
  exports: [DATABASE_CLIENT],
})
export class DatabaseModule {}
