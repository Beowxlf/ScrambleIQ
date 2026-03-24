import {
  REPORT_ARTIFACT_TYPES,
  type CollectionDateRange,
  type CollectionReportFilters,
  type ReportArtifactType,
} from '@scrambleiq/shared';

interface RawQuery {
  [key: string]: string | undefined;
}

interface BaseFiltersValidationResult {
  value?: CollectionReportFilters;
  errors: string[];
}

const baseAllowedFields = new Set(['dateFrom', 'dateTo', 'competitor', 'ruleset']);

export function validateCollectionReportFilters(payload: unknown): BaseFiltersValidationResult {
  const query = payload as RawQuery;
  const errors: string[] = [];

  for (const key of Object.keys(query)) {
    if (!baseAllowedFields.has(key)) {
      errors.push(`property ${key} should not exist`);
    }
  }

  return parseBaseFilters(query, errors);
}


function parseBaseFilters(query: RawQuery, errors: string[]): BaseFiltersValidationResult {
  const dateFrom = normalizeRequiredDate(query.dateFrom, 'dateFrom', errors);
  const dateTo = normalizeRequiredDate(query.dateTo, 'dateTo', errors);
  const competitor = normalizeOptionalNonEmptyString(query.competitor, 'competitor', errors);
  const ruleset = normalizeOptionalNonEmptyString(query.ruleset, 'ruleset', errors);

  if (dateFrom && dateTo && dateFrom > dateTo) {
    errors.push('dateFrom must be less than or equal to dateTo');
  }

  if (errors.length > 0 || !dateFrom || !dateTo) {
    return { errors };
  }

  const dateRange: CollectionDateRange = {
    startDate: dateFrom,
    endDate: dateTo,
  };

  return {
    errors,
    value: {
      dateRange,
      competitor,
      ruleset,
    },
  };
}

export function validateCollectionExportQuery(payload: unknown): {
  value?: { filters: CollectionReportFilters; artifactType: ReportArtifactType };
  errors: string[];
} {
  const query = payload as RawQuery;
  const errors: string[] = [];

  const allowedFields = new Set([...baseAllowedFields, 'artifactType']);

  for (const key of Object.keys(query)) {
    if (!allowedFields.has(key)) {
      errors.push(`property ${key} should not exist`);
    }
  }

  const filterValidation = parseBaseFilters(query, errors);

  const artifactType = normalizeArtifactType(query.artifactType, errors);

  if (!filterValidation.value || errors.length > 0) {
    return { errors };
  }

  return {
    errors,
    value: {
      filters: filterValidation.value,
      artifactType,
    },
  };
}

function normalizeOptionalNonEmptyString(value: string | undefined, field: string, errors: string[]): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value.trim().length === 0) {
    errors.push(`${field} should not be empty`);
    return undefined;
  }

  return value.trim();
}

function normalizeRequiredDate(value: string | undefined, field: string, errors: string[]): string | undefined {
  if (value === undefined) {
    errors.push(`${field} is required`);
    return undefined;
  }

  if (!isStrictIsoDate(value)) {
    errors.push(`${field} must be a valid date in YYYY-MM-DD format`);
    return undefined;
  }

  return value;
}

function normalizeArtifactType(value: string | undefined, errors: string[]): ReportArtifactType {
  if (value === undefined) {
    return 'period_summary';
  }

  if (!REPORT_ARTIFACT_TYPES.includes(value as ReportArtifactType)) {
    errors.push(`artifactType must be one of the following values: ${REPORT_ARTIFACT_TYPES.join(', ')}`);
    return 'period_summary';
  }

  return value as ReportArtifactType;
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
