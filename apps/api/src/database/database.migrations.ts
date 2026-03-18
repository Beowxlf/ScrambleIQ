import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { Injectable, OnModuleInit } from '@nestjs/common';

import { PsqlClient, sqlLiteral } from './database.client';

@Injectable()
export class DatabaseMigrationService implements OnModuleInit {
  constructor(private readonly client: PsqlClient) {}

  async onModuleInit(): Promise<void> {
    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const migrationDir = this.resolveMigrationDir();
    const migrationFiles = readdirSync(migrationDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    for (const migrationFile of migrationFiles) {
      const migrationId = migrationFile.replace('.sql', '');
      const rows = await this.client.rows<{ id: string }>(
        `SELECT id FROM public.schema_migrations WHERE id = ${sqlLiteral(migrationId)}`,
      );

      if (rows.length > 0) {
        continue;
      }

      const migrationPath = path.join(migrationDir, migrationFile);
      await this.client.execute(`\\i ${migrationPath}`);
      await this.client.execute(`INSERT INTO public.schema_migrations (id) VALUES (${sqlLiteral(migrationId)})`);
    }
  }

  private resolveMigrationDir(): string {
    const fromWorkspaceRoot = path.resolve(process.cwd(), 'apps/api/migrations');

    if (existsSync(fromWorkspaceRoot)) {
      return fromWorkspaceRoot;
    }

    const fromApiRoot = path.resolve(process.cwd(), 'migrations');

    if (existsSync(fromApiRoot)) {
      return fromApiRoot;
    }

    throw new Error('Unable to locate migration directory.');
  }
}
