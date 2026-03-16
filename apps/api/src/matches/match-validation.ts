import type { CreateMatchDto, UpdateMatchDto } from '@scrambleiq/shared';

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

  if (field === 'date' && !isValidDate(value)) {
    errors.push('date must be a valid date');
  }
}

function validateOptionalStringField(payload: Record<string, unknown>, errors: string[]): void {
  if ('notes' in payload && payload.notes !== undefined && typeof payload.notes !== 'string') {
    errors.push('notes must be a string');
  }
}

function validateAllowedFields(payload: Record<string, unknown>, errors: string[]): void {
  for (const key of Object.keys(payload)) {
    if (!allAllowedFields.has(key as keyof CreateMatchDto)) {
      errors.push(`property ${key} should not exist`);
    }
  }
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isNaN(Date.parse(value)) === false;
}
