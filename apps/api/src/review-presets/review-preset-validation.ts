import {
  MAX_EVENT_TYPE_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_TITLE_LENGTH,
  POSITION_TYPES,
  REVIEW_PRESET_SCOPE_TYPES,
  type PositionType,
  type ReviewPresetScopeType,
} from '@scrambleiq/shared';

import type { CreateReviewPresetDto } from './create-review-preset.dto';
import type { UpdateReviewPresetDto } from './update-review-preset.dto';

const requiredFields = ['name', 'scope', 'config'] as const;
const optionalFields = ['description'] as const;
const configAllowedFields = ['eventTypeFilters', 'competitorFilter', 'positionFilters', 'showOnlyValidationIssues'] as const;
const allAllowedFields = new Set([...requiredFields, ...optionalFields]);
const allConfigAllowedFields = new Set(configAllowedFields);

export function validateCreateReviewPresetPayload(payload: CreateReviewPresetDto): string[] {
  const errors: string[] = [];
  const body = payload as unknown as Record<string, unknown>;

  validateRequiredName(body, errors);
  validateOptionalDescription(body, errors);
  validateRequiredScope(body, errors);
  validateRequiredConfig(body, errors);
  validateAllowedFields(body, errors);

  return errors;
}

export function validateUpdateReviewPresetPayload(payload: UpdateReviewPresetDto): string[] {
  const errors: string[] = [];
  const body = payload as unknown as Record<string, unknown>;

  if (Object.keys(body).length === 0) {
    errors.push('At least one field must be provided for update');
    return errors;
  }

  if ('name' in body) {
    validateNameValue(body.name, errors);
  }

  validateOptionalDescription(body, errors);

  if ('scope' in body) {
    validateScopeValue(body.scope, errors);
  }

  if ('config' in body) {
    validateConfigValue(body.config, errors);
  }

  validateAllowedFields(body, errors);

  return errors;
}

function validateRequiredName(payload: Record<string, unknown>, errors: string[]): void {
  if (!('name' in payload)) {
    errors.push('name should not be empty');
    errors.push('name must be a string');
    return;
  }

  validateNameValue(payload.name, errors);
}

function validateNameValue(value: unknown, errors: string[]): void {
  if (typeof value !== 'string') {
    errors.push('name must be a string');
    return;
  }

  if (value.trim().length === 0) {
    errors.push('name should not be empty');
  }

  if (value.length > MAX_TITLE_LENGTH) {
    errors.push(`name must be shorter than or equal to ${MAX_TITLE_LENGTH} characters`);
  }
}

function validateOptionalDescription(payload: Record<string, unknown>, errors: string[]): void {
  if ('description' in payload && payload.description !== undefined) {
    if (typeof payload.description !== 'string') {
      errors.push('description must be a string');
      return;
    }

    if (payload.description.length > MAX_NOTES_LENGTH) {
      errors.push(`description must be shorter than or equal to ${MAX_NOTES_LENGTH} characters`);
    }
  }
}

function validateRequiredScope(payload: Record<string, unknown>, errors: string[]): void {
  if (!('scope' in payload)) {
    errors.push('scope should not be empty');
    errors.push(`scope must be one of the following values: ${REVIEW_PRESET_SCOPE_TYPES.join(', ')}`);
    return;
  }

  validateScopeValue(payload.scope, errors);
}

function validateScopeValue(value: unknown, errors: string[]): void {
  if (typeof value !== 'string' || REVIEW_PRESET_SCOPE_TYPES.includes(value as ReviewPresetScopeType) === false) {
    errors.push(`scope must be one of the following values: ${REVIEW_PRESET_SCOPE_TYPES.join(', ')}`);
  }
}

function validateRequiredConfig(payload: Record<string, unknown>, errors: string[]): void {
  if (!('config' in payload)) {
    errors.push('config should not be empty');
    errors.push('config must be an object');
    return;
  }

  validateConfigValue(payload.config, errors);
}

function validateConfigValue(value: unknown, errors: string[]): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push('config must be an object');
    return;
  }

  const config = value as Record<string, unknown>;

  if ('eventTypeFilters' in config) {
    validateEventTypeFilters(config.eventTypeFilters, errors);
  }

  if ('competitorFilter' in config) {
    validateCompetitorFilter(config.competitorFilter, errors);
  }

  if ('positionFilters' in config) {
    validatePositionFilters(config.positionFilters, errors);
  }

  if ('showOnlyValidationIssues' in config && config.showOnlyValidationIssues !== undefined) {
    if (typeof config.showOnlyValidationIssues !== 'boolean') {
      errors.push('config.showOnlyValidationIssues must be a boolean value');
    }
  }

  for (const key of Object.keys(config)) {
    if (!allConfigAllowedFields.has(key as (typeof configAllowedFields)[number])) {
      errors.push(`config property ${key} should not exist`);
    }
  }
}

function validateEventTypeFilters(value: unknown, errors: string[]): void {
  if (value === undefined) {
    return;
  }

  if (!Array.isArray(value)) {
    errors.push('config.eventTypeFilters must be an array');
    return;
  }

  const normalizedEventTypes = new Set<string>();

  value.forEach((item, index) => {
    if (typeof item !== 'string') {
      errors.push(`config.eventTypeFilters[${index}] must be a string`);
      return;
    }

    if (item.trim().length === 0) {
      errors.push(`config.eventTypeFilters[${index}] should not be empty`);
      return;
    }

    if (item.length > MAX_EVENT_TYPE_LENGTH) {
      errors.push(`config.eventTypeFilters[${index}] must be shorter than or equal to ${MAX_EVENT_TYPE_LENGTH} characters`);
      return;
    }

    const normalized = item.trim().toLowerCase();

    if (normalizedEventTypes.has(normalized)) {
      errors.push(`config.eventTypeFilters[${index}] must be unique`);
      return;
    }

    normalizedEventTypes.add(normalized);
  });
}

function validateCompetitorFilter(value: unknown, errors: string[]): void {
  if (value === undefined) {
    return;
  }

  if (value !== 'A' && value !== 'B') {
    errors.push('config.competitorFilter must be one of the following values: A, B');
  }
}

function validatePositionFilters(value: unknown, errors: string[]): void {
  if (value === undefined) {
    return;
  }

  if (!Array.isArray(value)) {
    errors.push('config.positionFilters must be an array');
    return;
  }

  const usedPositions = new Set<PositionType>();

  value.forEach((item, index) => {
    if (typeof item !== 'string' || POSITION_TYPES.includes(item as PositionType) === false) {
      errors.push(`config.positionFilters[${index}] must be one of the following values: ${POSITION_TYPES.join(', ')}`);
      return;
    }

    const position = item as PositionType;

    if (usedPositions.has(position)) {
      errors.push(`config.positionFilters[${index}] must be unique`);
      return;
    }

    usedPositions.add(position);
  });
}

function validateAllowedFields(payload: Record<string, unknown>, errors: string[]): void {
  for (const key of Object.keys(payload)) {
    if (!allAllowedFields.has(key as (typeof requiredFields)[number])) {
      errors.push(`property ${key} should not exist`);
    }
  }
}
