import { beforeEach, describe, expect, it, vi } from 'vitest';

const { execFileMock } = vi.hoisted(() => ({
  execFileMock: vi.fn(),
}));

vi.mock('node:child_process', () => ({
  execFile: execFileMock,
}));

import { PsqlClient } from '../src/database/database.client';

describe('PsqlClient rows SQL wrapping', () => {
  beforeEach(() => {
    execFileMock.mockReset();
    execFileMock.mockImplementation((_cmd, _args, callback) => {
      callback(null, { stdout: '[]', stderr: '' });
    });
  });

  it('wraps INSERT statements with a CTE before JSON aggregation', async () => {
    const client = new PsqlClient('postgresql://example');

    await client.rows<{ id: string }>(`INSERT INTO matches (title) VALUES ('Finals') RETURNING id;`);

    expect(execFileMock).toHaveBeenCalledTimes(1);
    expect(execFileMock).toHaveBeenCalledWith(
      'psql',
      [
        'postgresql://example',
        '-tA',
        '-c',
        "WITH t AS (INSERT INTO matches (title) VALUES ('Finals') RETURNING id) SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)::text FROM t;",
      ],
      expect.any(Function),
    );
  });

  it('keeps SELECT wrapping in a subquery for read queries', async () => {
    const client = new PsqlClient('postgresql://example');

    await client.rows<{ id: string }>('SELECT id FROM matches');

    expect(execFileMock).toHaveBeenCalledTimes(1);
    expect(execFileMock).toHaveBeenCalledWith(
      'psql',
      [
        'postgresql://example',
        '-tA',
        '-c',
        "SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)::text FROM (SELECT id FROM matches) t;",
      ],
      expect.any(Function),
    );
  });
});
