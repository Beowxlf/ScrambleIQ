import type { CreateTimelineEventDto, UpdateTimelineEventDto } from '@scrambleiq/shared';

const requiredFields = ['timestamp', 'eventType', 'competitor'] as const;
const optionalFields = ['notes'] as const;
const allAllowedFields = new Set([...requiredFields, ...optionalFields]);

export function validateCreateTimelineEventPayload(payload: CreateTimelineEventDto): string[] {
  const errors: string[] = [];
  const body = payload as unknown as Record<string, unknown>;

  validateRequiredTimestamp(body, errors);
  validateRequiredEventType(body, errors);
  validateRequiredCompetitor(body, errors);
  validateOptionalNotes(body, errors);
  validateAllowedFields(body, errors);

  return errors;
}

export function validateUpdateTimelineEventPayload(payload: UpdateTimelineEventDto): string[] {
  const errors: string[] = [];
  const body = payload as unknown as Record<string, unknown>;

  if ('timestamp' in body) {
    validateTimestampValue(body.timestamp, errors);
  }

  if ('eventType' in body) {
    validateEventTypeValue(body.eventType, errors);
  }

  if ('competitor' in body) {
    validateCompetitorValue(body.competitor, errors);
  }

  validateOptionalNotes(body, errors);
  validateAllowedFields(body, errors);

  return errors;
}

function validateRequiredTimestamp(payload: Record<string, unknown>, errors: string[]): void {
  if (!('timestamp' in payload)) {
    errors.push('timestamp should not be empty');
    errors.push('timestamp must be a number conforming to the specified constraints');
    return;
  }

  validateTimestampValue(payload.timestamp, errors);
}

function validateTimestampValue(value: unknown, errors: string[]): void {
  if (typeof value !== 'number' || Number.isFinite(value) === false || Number.isInteger(value) === false) {
    errors.push('timestamp must be a number conforming to the specified constraints');
    return;
  }

  if (value < 0) {
    errors.push('timestamp must not be less than 0');
  }
}

function validateRequiredEventType(payload: Record<string, unknown>, errors: string[]): void {
  if (!('eventType' in payload)) {
    errors.push('eventType should not be empty');
    errors.push('eventType must be a string');
    return;
  }

  validateEventTypeValue(payload.eventType, errors);
}

function validateEventTypeValue(value: unknown, errors: string[]): void {
  if (typeof value !== 'string') {
    errors.push('eventType must be a string');
    return;
  }

  if (value.trim().length === 0) {
    errors.push('eventType should not be empty');
  }
}

function validateRequiredCompetitor(payload: Record<string, unknown>, errors: string[]): void {
  if (!('competitor' in payload)) {
    errors.push('competitor should not be empty');
    errors.push('competitor must be one of the following values: A, B');
    return;
  }

  validateCompetitorValue(payload.competitor, errors);
}

function validateCompetitorValue(value: unknown, errors: string[]): void {
  if (value !== 'A' && value !== 'B') {
    errors.push('competitor must be one of the following values: A, B');
  }
}

function validateOptionalNotes(payload: Record<string, unknown>, errors: string[]): void {
  if ('notes' in payload && payload.notes !== undefined && typeof payload.notes !== 'string') {
    errors.push('notes must be a string');
  }
}

function validateAllowedFields(payload: Record<string, unknown>, errors: string[]): void {
  for (const key of Object.keys(payload)) {
    if (!allAllowedFields.has(key as (typeof requiredFields)[number])) {
      errors.push(`property ${key} should not exist`);
    }
  }
}
