import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { DatasetValidationReport } from '@scrambleiq/shared';

import { PsqlClient } from '../../src/database/database.client';
import {
  PostgresDatasetValidationRepository,
  PostgresEventRepository,
  PostgresMatchRepository,
  PostgresPositionRepository,
  PostgresVideoRepository,
} from '../../src/repositories/postgres.repositories';
import { prepareDatabase, requireDatabaseUrl, truncateDomainTables } from './postgres-test.utils';

describe('PostgreSQL repositories integration', () => {
  const client = new PsqlClient(requireDatabaseUrl());
  const matchRepository = new PostgresMatchRepository(client);
  const eventRepository = new PostgresEventRepository(client);
  const positionRepository = new PostgresPositionRepository(client);
  const videoRepository = new PostgresVideoRepository(client);
  const validationRepository = new PostgresDatasetValidationRepository(client);

  beforeAll(async () => {
    await prepareDatabase(client);
  });

  beforeEach(async () => {
    await truncateDomainTables(client);
  });

  it('applies migrations and creates expected tables + fk constraints', async () => {
    const tables = await client.rows<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name ASC
    `);

    expect(tables.map((table) => table.table_name)).toEqual(
      expect.arrayContaining([
        'dataset_validation_results',
        'events',
        'matches',
        'positions',
        'schema_migrations',
        'videos',
      ]),
    );

    const foreignKeys = await client.rows<{ table_name: string; constraint_name: string }>(`
      SELECT tc.table_name, tc.constraint_name
      FROM information_schema.table_constraints tc
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name
    `);

    expect(foreignKeys.map((key) => key.table_name)).toEqual(
      expect.arrayContaining(['dataset_validation_results', 'events', 'positions', 'videos']),
    );
  });

  it('supports MatchRepository CRUD', async () => {
    const created = await matchRepository.create({
      title: 'Final Match',
      date: '2026-05-20',
      ruleset: 'No-Gi',
      competitorA: 'Athlete A',
      competitorB: 'Athlete B',
      notes: 'Opening round',
    });

    const fetched = await matchRepository.findById(created.id);
    expect(fetched?.title).toBe('Final Match');

    const updated = await matchRepository.update(created.id, {
      title: 'Updated Match',
      notes: 'Updated notes',
    });

    expect(updated?.title).toBe('Updated Match');
    expect(updated?.notes).toBe('Updated notes');

    const deleted = await matchRepository.delete(created.id);
    expect(deleted).toBe(true);
    await expect(matchRepository.findById(created.id)).resolves.toBeUndefined();
  });

  it('supports EventRepository operations and ON DELETE CASCADE', async () => {
    const match = await matchRepository.create({
      title: 'Events Match',
      date: '2026-06-01',
      ruleset: 'Gi',
      competitorA: 'A',
      competitorB: 'B',
      notes: '',
    });

    const event = await eventRepository.create(match.id, {
      timestamp: 42,
      eventType: 'guard_pass',
      competitor: 'A',
      notes: 'clean pass',
    });

    const events = await eventRepository.findByMatchId(match.id);
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe(event.id);

    const deletedEvent = await eventRepository.delete(event.id);
    expect(deletedEvent).toBe(true);
    expect(await eventRepository.findByMatchId(match.id)).toHaveLength(0);

    const eventForCascade = await eventRepository.create(match.id, {
      timestamp: 99,
      eventType: 'sweep',
      competitor: 'B',
      notes: undefined,
    });
    expect(eventForCascade.id).toBeDefined();

    await matchRepository.delete(match.id);
    expect(await eventRepository.findByMatchId(match.id)).toHaveLength(0);
  });

  it('supports PositionRepository create/update/list', async () => {
    const match = await matchRepository.create({
      title: 'Position Match',
      date: '2026-06-02',
      ruleset: 'No-Gi',
      competitorA: 'A',
      competitorB: 'B',
      notes: '',
    });

    const created = await positionRepository.create(match.id, {
      position: 'half_guard',
      competitorTop: 'A',
      timestampStart: 10,
      timestampEnd: 20,
      notes: 'entry',
    });

    const updated = await positionRepository.update(created.id, {
      position: 'mount',
      timestampEnd: 24,
    });

    expect(updated?.position).toBe('mount');
    expect(updated?.timestampEnd).toBe(24);

    const positions = await positionRepository.findByMatchId(match.id);
    expect(positions).toHaveLength(1);
    expect(positions[0].id).toBe(created.id);
  });

  it('supports VideoRepository attach/update/delete metadata', async () => {
    const match = await matchRepository.create({
      title: 'Video Match',
      date: '2026-06-03',
      ruleset: 'No-Gi',
      competitorA: 'A',
      competitorB: 'B',
      notes: '',
    });

    const created = await videoRepository.create(match.id, {
      title: 'Camera 1',
      sourceType: 'remote_url',
      sourceUrl: 'https://example.com/video.mp4',
      durationSeconds: 300,
      notes: 'initial upload',
    });

    expect(created.matchId).toBe(match.id);

    const updated = await videoRepository.update(created.id, {
      title: 'Updated camera',
      durationSeconds: 310,
    });

    expect(updated?.title).toBe('Updated camera');
    expect(updated?.durationSeconds).toBe(310);

    const deleted = await videoRepository.delete(created.id);
    expect(deleted).toBe(true);
    await expect(videoRepository.findByMatchId(match.id)).resolves.toBeUndefined();
  });

  it('supports DatasetValidationRepository upsert/fetch', async () => {
    const match = await matchRepository.create({
      title: 'Validation Match',
      date: '2026-06-04',
      ruleset: 'Gi',
      competitorA: 'A',
      competitorB: 'B',
      notes: '',
    });
    await expect(matchRepository.findById(match.id)).resolves.toBeDefined();

    const report: DatasetValidationReport = {
      matchId: match.id,
      isValid: false,
      issueCount: 1,
      issues: [
        {
          type: 'MISSING_VIDEO',
          severity: 'WARNING',
          message: 'missing video',
          context: { matchId: match.id },
        },
      ],
    };

    await validationRepository.upsert(match.id, report);

    const fetched = await validationRepository.findByMatchId(match.id);
    expect(fetched).toEqual(report);
  });

  it('surfaces repository failures for foreign-key violations on unknown matches', async () => {
    const unknownMatchId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

    await expect(eventRepository.create(unknownMatchId, {
      timestamp: 10,
      eventType: 'entry',
      competitor: 'A',
      notes: 'should fail',
    })).rejects.toThrow();

    await expect(positionRepository.create(unknownMatchId, {
      position: 'standing',
      competitorTop: 'A',
      timestampStart: 0,
      timestampEnd: 5,
      notes: 'should fail',
    })).rejects.toThrow();

    await expect(videoRepository.create(unknownMatchId, {
      title: 'Orphaned',
      sourceType: 'remote_url',
      sourceUrl: 'https://example.com/video.mp4',
      durationSeconds: 10,
      notes: 'should fail',
    })).rejects.toThrow();

    await expect(validationRepository.upsert(unknownMatchId, {
      matchId: unknownMatchId,
      isValid: true,
      issueCount: 0,
      issues: [],
    })).rejects.toThrow();
  });
});
