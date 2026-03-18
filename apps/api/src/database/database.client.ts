import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const trailingSemicolonPattern = /;\s*$/u;
const dataMutationPattern = /^(INSERT|UPDATE|DELETE)\b/i;

export function sqlLiteral(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL';
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  return `'${value.replace(/'/g, "''")}'`;
}

export class PsqlClient {
  constructor(private readonly databaseUrl: string) {}

  async rows<T>(sql: string): Promise<T[]> {
    const statement = sql.trim().replace(trailingSemicolonPattern, '');
    const wrapped = dataMutationPattern.test(statement)
      ? `WITH t AS (${statement}) SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)::text FROM t;`
      : `SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)::text FROM (${statement}) t;`;
    const { stdout } = await execFileAsync('psql', [this.databaseUrl, '-tA', '-c', wrapped]);
    const output = stdout.trim();
    return (output ? JSON.parse(output) : []) as T[];
  }

  async execute(sql: string): Promise<void> {
    await execFileAsync('psql', [this.databaseUrl, '-v', 'ON_ERROR_STOP=1', '-c', sql]);
  }
}
