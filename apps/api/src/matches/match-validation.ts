import {
  MAX_COMPETITOR_NAME_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_RULESET_LENGTH,
  MAX_TITLE_LENGTH,
  type CreateMatchDto,
  type UpdateMatchDto,
} from '@scrambleiq/shared';

const requiredStringFields = ['title', 'date', 'ruleset', 'competitorA', 'competitorB'] as const;
const optionalStringFields = ['notes'] as const;
const allAllowedFields = new Set([...requiredStringFields, ...optionalStringFields]);

export function validateCreateMatchPayload(payload: CreateMatchDto): string[] {
  const errors: string[] = [];
  const body = payload as unknown as Record<string, unknown>;

  for (const field of requiredStringFields) {
    if (!(field in body)) {
      errors.push(`${field} should not be empty`);
      errors.push(`${field} must be a string`);
      continue;
    }

    validateStringField(body, field, errors);
  }

  validateOptionalStringField(body, errors);
  validateAllowedFields(body, errors);

  return errors;
}

export function validateUpdateMatchPayload(payload: UpdateMatchDto): string[] {
  const errors: string[] = [];
  const body = payload as unknown as Record<string, unknown>;

  for (const field of requiredStringFields) {
    if (field in body) {
      validateStringField(body, field, errors);
    }
  }

  validateOptionalStringField(body, errors);
  validateAllowedFields(body, errors);

  return errors;
}

function validateStringField(
  payload: Record<string, unknown>,
  field: (typeof requiredStringFields)[number],
  errors: string[],
): void {
  const value = payload[field];

  if (typeof value !== 'string') {
    errors.push(`${field} must be a string`);
    return;
  }

  if (value.trim().length === 0) {
    errors.push(`${field} should not be empty`);
    return;
  }

  if (field === 'date' && !isStrictIsoDate(value)) {
    errors.push('date must be a valid date in YYYY-MM-DD format');
    return;
  }

  const maxLengths: Record<string, number> = {
    title: MAX_TITLE_LENGTH,
    ruleset: MAX_RULESET_LENGTH,
    competitorA: MAX_COMPETITOR_NAME_LENGTH,
    competitorB: MAX_COMPETITOR_NAME_LENGTH,
  };

  const maxLength = maxLengths[field];

  if (maxLength !== undefined && value.length > maxLength) {
    errors.push(`${field} must be shorter than or equal to ${maxLength} characters`);
  }
}

function validateOptionalStringField(payload: Record<string, unknown>, errors: string[]): void {
  if ('notes' in payload) {
    if (payload.notes !== undefined && typeof payload.notes !== 'string') {
      errors.push('notes must be a string');
      return;
    }

    if (typeof payload.notes === 'string' && payload.notes.length > MAX_NOTES_LENGTH) {
      errors.push(`notes must be shorter than or equal to ${MAX_NOTES_LENGTH} characters`);
    }
  }
}

function validateAllowedFields(payload: Record<string, unknown>, errors: string[]): void {
  for (const key of Object.keys(payload)) {
    if (!allAllowedFields.has(key as keyof CreateMatchDto)) {
      errors.push(`property ${key} should not exist`);
    }
  }
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
