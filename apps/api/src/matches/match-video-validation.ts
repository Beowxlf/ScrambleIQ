import {
  MATCH_VIDEO_SOURCE_TYPES,
  MAX_NOTES_LENGTH,
  MAX_SOURCE_URL_LENGTH,
  MAX_TITLE_LENGTH,
  type CreateMatchVideoDto,
  type UpdateMatchVideoDto,
} from '@scrambleiq/shared';

const requiredFields = ['title', 'sourceType', 'sourceUrl'] as const;
const optionalFields = ['durationSeconds', 'notes'] as const;
const allAllowedFields = new Set([...requiredFields, ...optionalFields]);

export function validateCreateMatchVideoPayload(payload: CreateMatchVideoDto): string[] {
  const errors: string[] = [];
  const body = payload as unknown as Record<string, unknown>;

  validateRequiredTitle(body, errors);
  validateRequiredSourceType(body, errors);
  validateRequiredSourceUrl(body, errors);
  validateOptionalDurationSeconds(body, errors);
  validateOptionalNotes(body, errors);
  validateAllowedFields(body, errors);

  return errors;
}

export function validateUpdateMatchVideoPayload(payload: UpdateMatchVideoDto): string[] {
  const errors: string[] = [];
  const body = payload as unknown as Record<string, unknown>;

  if (Object.keys(body).length === 0) {
    errors.push('At least one field must be provided for update');
    return errors;
  }

  if ('title' in body) {
    validateTitleValue(body.title, errors);
  }

  if ('sourceType' in body) {
    validateSourceTypeValue(body.sourceType, errors);
  }

  if ('sourceUrl' in body) {
    validateSourceUrlValue(body.sourceUrl, errors);
  }

  validateOptionalDurationSeconds(body, errors);
  validateOptionalNotes(body, errors);
  validateAllowedFields(body, errors);

  return errors;
}

function validateRequiredTitle(payload: Record<string, unknown>, errors: string[]): void {
  if (!('title' in payload)) {
    errors.push('title should not be empty');
    errors.push('title must be a string');
    return;
  }

  validateTitleValue(payload.title, errors);
}

function validateTitleValue(value: unknown, errors: string[]): void {
  if (typeof value !== 'string') {
    errors.push('title must be a string');
    return;
  }

  if (value.trim().length === 0) {
    errors.push('title should not be empty');
  }

  if (value.length > MAX_TITLE_LENGTH) {
    errors.push(`title must be shorter than or equal to ${MAX_TITLE_LENGTH} characters`);
  }
}

function validateRequiredSourceType(payload: Record<string, unknown>, errors: string[]): void {
  if (!('sourceType' in payload)) {
    errors.push('sourceType should not be empty');
    errors.push(`sourceType must be one of the following values: ${MATCH_VIDEO_SOURCE_TYPES.join(', ')}`);
    return;
  }

  validateSourceTypeValue(payload.sourceType, errors);
}

function validateSourceTypeValue(value: unknown, errors: string[]): void {
  if (typeof value !== 'string' || MATCH_VIDEO_SOURCE_TYPES.includes(value as (typeof MATCH_VIDEO_SOURCE_TYPES)[number]) === false) {
    errors.push(`sourceType must be one of the following values: ${MATCH_VIDEO_SOURCE_TYPES.join(', ')}`);
  }
}

function validateRequiredSourceUrl(payload: Record<string, unknown>, errors: string[]): void {
  if (!('sourceUrl' in payload)) {
    errors.push('sourceUrl should not be empty');
    errors.push('sourceUrl must be a string');
    return;
  }

  validateSourceUrlValue(payload.sourceUrl, errors);
}

function validateSourceUrlValue(value: unknown, errors: string[]): void {
  if (typeof value !== 'string') {
    errors.push('sourceUrl must be a string');
    return;
  }

  if (value.trim().length === 0) {
    errors.push('sourceUrl should not be empty');
  }

  if (value.length > MAX_SOURCE_URL_LENGTH) {
    errors.push(`sourceUrl must be shorter than or equal to ${MAX_SOURCE_URL_LENGTH} characters`);
  }
}

function validateOptionalDurationSeconds(payload: Record<string, unknown>, errors: string[]): void {
  if ('durationSeconds' in payload && payload.durationSeconds !== undefined) {
    if (
      typeof payload.durationSeconds !== 'number' ||
      Number.isFinite(payload.durationSeconds) === false ||
      Number.isInteger(payload.durationSeconds) === false
    ) {
      errors.push('durationSeconds must be a number conforming to the specified constraints');
      return;
    }

    if (payload.durationSeconds < 0) {
      errors.push('durationSeconds must not be less than 0');
    }
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
    if (!allAllowedFields.has(key as keyof CreateMatchVideoDto)) {
      errors.push(`property ${key} should not exist`);
    }
  }
}
