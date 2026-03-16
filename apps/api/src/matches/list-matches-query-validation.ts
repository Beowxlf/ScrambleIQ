import type { ListMatchesQueryDto } from './list-matches-query.dto';

const allowedFields = new Set(['competitor', 'dateFrom', 'dateTo', 'hasVideo', 'limit', 'offset']);

export interface ValidatedMatchListQuery {
  competitor?: string;
  dateFrom?: string;
  dateTo?: string;
  hasVideo?: boolean;
  limit: number;
  offset: number;
}

export function validateAndNormalizeListMatchesQuery(payload: ListMatchesQueryDto): {
  value?: ValidatedMatchListQuery;
  errors: string[];
} {
  const errors: string[] = [];
  const query = payload as unknown as Record<string, string | undefined>;

  for (const key of Object.keys(query)) {
    if (!allowedFields.has(key)) {
      errors.push(`property ${key} should not exist`);
    }
  }

  const competitor = normalizeOptionalNonEmptyString(query.competitor, 'competitor', errors);
  const dateFrom = normalizeOptionalDate(query.dateFrom, 'dateFrom', errors);
  const dateTo = normalizeOptionalDate(query.dateTo, 'dateTo', errors);

  let hasVideo: boolean | undefined;
  if (query.hasVideo !== undefined) {
    if (query.hasVideo === 'true') {
      hasVideo = true;
    } else if (query.hasVideo === 'false') {
      hasVideo = false;
    } else {
      errors.push('hasVideo must be one of the following values: true, false');
    }
  }

  const limit = normalizeOptionalInteger(query.limit, 'limit', 1, 100, 50, errors);
  const offset = normalizeOptionalInteger(query.offset, 'offset', 0, Number.MAX_SAFE_INTEGER, 0, errors);

  if (dateFrom && dateTo && dateFrom > dateTo) {
    errors.push('dateFrom must be less than or equal to dateTo');
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors,
    value: {
      competitor,
      dateFrom,
      dateTo,
      hasVideo,
      limit,
      offset,
    },
  };
}

function normalizeOptionalNonEmptyString(
  value: string | undefined,
  field: string,
  errors: string[],
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value.trim().length === 0) {
    errors.push(`${field} should not be empty`);
    return undefined;
  }

  return value.trim();
}

function normalizeOptionalDate(value: string | undefined, field: string, errors: string[]): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isStrictIsoDate(value)) {
    errors.push(`${field} must be a valid date in YYYY-MM-DD format`);
    return undefined;
  }

  return value;
}

function normalizeOptionalInteger(
  value: string | undefined,
  field: string,
  min: number,
  max: number,
  defaultValue: number,
  errors: string[],
): number {
  if (value === undefined) {
    return defaultValue;
  }

  if (/^-?\d+$/.test(value) === false) {
    errors.push(`${field} must be an integer number`);
    return defaultValue;
  }

  const parsed = Number.parseInt(value, 10);

  if (parsed < min) {
    errors.push(`${field} must not be less than ${min}`);
    return defaultValue;
  }

  if (parsed > max) {
    errors.push(`${field} must not be greater than ${max}`);
    return defaultValue;
  }

  return parsed;
}

function isStrictIsoDate(value: string): boolean {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value) === false) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() + 1 === month
    && parsed.getUTCDate() === day;
}
