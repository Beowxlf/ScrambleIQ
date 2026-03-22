import { DatabaseMigrationService } from '../../src/database/database.migrations';
import { PsqlClient } from '../../src/database/database.client';

export function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for PostgreSQL integration tests.');
  }

  return databaseUrl;
}

export async function resetDatabase(client: PsqlClient): Promise<void> {
  await client.execute('DROP SCHEMA IF EXISTS public CASCADE');
  await client.execute('CREATE SCHEMA public');
}

export async function runMigrations(client: PsqlClient): Promise<void> {
  const migrationService = new DatabaseMigrationService(client);
  await migrationService.onModuleInit();
}

export async function prepareDatabase(client: PsqlClient): Promise<void> {
  await resetDatabase(client);
  await runMigrations(client);
}

export async function truncateDomainTables(client: PsqlClient): Promise<void> {
  await client.execute(
    'TRUNCATE TABLE public.review_template_checklist_items, public.review_templates, public.review_presets, public.dataset_validation_results, public.videos, public.positions, public.events, public.matches RESTART IDENTITY CASCADE',
  );
}
