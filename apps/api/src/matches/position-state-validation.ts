import {
  MAX_NOTES_LENGTH,
  POSITION_TYPES,
  type CreatePositionStateDto,
  type UpdatePositionStateDto,
} from '@scrambleiq/shared';

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
  validateOptionalNotes(body, errors);
  validateAllowedFields(body, errors);

  if (typeof body.timestampStart === 'number' && typeof body.timestampEnd === 'number' && body.timestampEnd <= body.timestampStart) {
    errors.push('timestampEnd must be greater than timestampStart');
  }

  return errors;
}

export function validateUpdatePositionStatePayload(payload: UpdatePositionStateDto): string[] {
  const errors: string[] = [];
  const body = payload as unknown as Record<string, unknown>;

  if (Object.keys(body).length === 0) {
    errors.push('At least one field must be provided for update');
    return errors;
  }

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

  validateOptionalNotes(body, errors);
  validateAllowedFields(body, errors);

  if (typeof body.timestampStart === 'number' && typeof body.timestampEnd === 'number' && body.timestampEnd <= body.timestampStart) {
    errors.push('timestampEnd must be greater than timestampStart');
  }

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
  if (typeof value !== 'string' || POSITION_TYPES.includes(value as (typeof POSITION_TYPES)[number]) === false) {
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
  if (typeof value !== 'number' || Number.isFinite(value) === false || Number.isInteger(value) === false) {
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
  if (typeof value !== 'number' || Number.isFinite(value) === false || Number.isInteger(value) === false) {
    errors.push('timestampEnd must be a number conforming to the specified constraints');
    return;
  }

  if (value < 0) {
    errors.push('timestampEnd must not be less than 0');
  }
}

function validateOptionalNotes(payload: Record<string, unknown>, errors: string[]): void {
  if ('notes' in payload && payload.notes !== undefined) {
    if (typeof payload.notes !== 'string') {
      errors.push('notes must be a string');
      return;
    }

    if (payload.notes.length > MAX_NOTES_LENGTH) {
      errors.push(`notes must be shorter than or equal to ${MAX_NOTES_LENGTH} characters`);
    }
  }
}

function validateAllowedFields(payload: Record<string, unknown>, errors: string[]): void {
  for (const key of Object.keys(payload)) {
    if (!allAllowedFields.has(key as keyof CreatePositionStateDto)) {
      errors.push(`property ${key} should not exist`);
    }
  }
}
