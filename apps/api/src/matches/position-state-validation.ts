import { POSITION_TYPES, type CreatePositionStateDto, type UpdatePositionStateDto } from '@scrambleiq/shared';

const requiredFields = ['position', 'competitorTop', 'timestampStart', 'timestampEnd'] as const;
const optionalFields = ['notes'] as const;
const allAllowedFields = new Set([...requiredFields, ...optionalFields]);

export function validateCreatePositionStatePayload(payload: CreatePositionStateDto): string[] {
  const errors: string[] = [];
  const body = payload as unknown as Record<string, unknown>;

  validateRequiredPosition(body, errors);
  validateRequiredCompetitorTop(body, errors);
  validateRequiredTimestampStart(body, errors);
  validateRequiredTimestampEnd(body, errors);
  validateTimestampRange(body, errors);
  validateOptionalNotes(body, errors);
  validateAllowedFields(body, errors);

  return errors;
}

export function validateUpdatePositionStatePayload(payload: UpdatePositionStateDto): string[] {
  const errors: string[] = [];
  const body = payload as unknown as Record<string, unknown>;

  if ('position' in body) {
    validatePositionValue(body.position, errors);
  }

  if ('competitorTop' in body) {
    validateCompetitorTopValue(body.competitorTop, errors);
  }

  if ('timestampStart' in body) {
    validateTimestampStartValue(body.timestampStart, errors);
  }

  if ('timestampEnd' in body) {
    validateTimestampEndValue(body.timestampEnd, errors);
  }

  validateTimestampRange(body, errors);
  validateOptionalNotes(body, errors);
  validateAllowedFields(body, errors);

  return errors;
}

function validateRequiredPosition(payload: Record<string, unknown>, errors: string[]): void {
  if (!('position' in payload)) {
    errors.push('position should not be empty');
    errors.push(`position must be one of the following values: ${POSITION_TYPES.join(', ')}`);
    return;
  }

  validatePositionValue(payload.position, errors);
}

function validatePositionValue(value: unknown, errors: string[]): void {
  if (typeof value !== 'string' || !POSITION_TYPES.includes(value as (typeof POSITION_TYPES)[number])) {
    errors.push(`position must be one of the following values: ${POSITION_TYPES.join(', ')}`);
  }
}

function validateRequiredCompetitorTop(payload: Record<string, unknown>, errors: string[]): void {
  if (!('competitorTop' in payload)) {
    errors.push('competitorTop should not be empty');
    errors.push('competitorTop must be one of the following values: A, B');
    return;
  }

  validateCompetitorTopValue(payload.competitorTop, errors);
}

function validateCompetitorTopValue(value: unknown, errors: string[]): void {
  if (value !== 'A' && value !== 'B') {
    errors.push('competitorTop must be one of the following values: A, B');
  }
}

function validateRequiredTimestampStart(payload: Record<string, unknown>, errors: string[]): void {
  if (!('timestampStart' in payload)) {
    errors.push('timestampStart should not be empty');
    errors.push('timestampStart must be a number conforming to the specified constraints');
    return;
  }

  validateTimestampStartValue(payload.timestampStart, errors);
}

function validateTimestampStartValue(value: unknown, errors: string[]): void {
  if (typeof value !== 'number' || Number.isInteger(value) === false) {
    errors.push('timestampStart must be a number conforming to the specified constraints');
    return;
  }

  if (value < 0) {
    errors.push('timestampStart must not be less than 0');
  }
}

function validateRequiredTimestampEnd(payload: Record<string, unknown>, errors: string[]): void {
  if (!('timestampEnd' in payload)) {
    errors.push('timestampEnd should not be empty');
    errors.push('timestampEnd must be a number conforming to the specified constraints');
    return;
  }

  validateTimestampEndValue(payload.timestampEnd, errors);
}

function validateTimestampEndValue(value: unknown, errors: string[]): void {
  if (typeof value !== 'number' || Number.isInteger(value) === false) {
    errors.push('timestampEnd must be a number conforming to the specified constraints');
  }
}

function validateTimestampRange(payload: Record<string, unknown>, errors: string[]): void {
  if (typeof payload.timestampStart !== 'number' || typeof payload.timestampEnd !== 'number') {
    return;
  }

  if (payload.timestampEnd <= payload.timestampStart) {
    errors.push('timestampEnd must be greater than timestampStart');
  }
}

function validateOptionalNotes(payload: Record<string, unknown>, errors: string[]): void {
  if (!('notes' in payload)) {
    return;
  }

  if (typeof payload.notes !== 'string') {
    errors.push('notes must be a string');
  }
}

function validateAllowedFields(payload: Record<string, unknown>, errors: string[]): void {
  for (const key of Object.keys(payload)) {
    if (allAllowedFields.has(key as (typeof requiredFields)[number] | (typeof optionalFields)[number])) {
      continue;
    }

    errors.push(`property ${key} should not exist`);
  }
}
