import { MAX_EVENT_TYPE_LENGTH } from '@scrambleiq/shared';

import { TaxonomyNormalizationDto } from './taxonomy-normalization.dto';

export function validateTaxonomyNormalizationPayload(payload: TaxonomyNormalizationDto): string[] {
  const errors: string[] = [];

  if (!payload || typeof payload !== 'object') {
    return ['payload must be an object'];
  }

  if (payload.field !== 'eventType') {
    errors.push('field must be eventType');
  }

  if (typeof payload.action !== 'string' || payload.action.trim().length === 0) {
    errors.push('action must be a non-empty string');
  } else if (payload.action !== 'none' && payload.action !== 'apply_canonical') {
    errors.push('action must be one of: none, apply_canonical');
  }

  if (typeof payload.fromValue !== 'string') {
    errors.push('fromValue must be a string');
  } else if (payload.fromValue.trim().length === 0) {
    errors.push('fromValue should not be empty');
  } else if (payload.fromValue.length > MAX_EVENT_TYPE_LENGTH) {
    errors.push(`fromValue must be shorter than or equal to ${MAX_EVENT_TYPE_LENGTH} characters`);
  }

  if (typeof payload.toValue !== 'string') {
    errors.push('toValue must be a string');
  } else if (payload.toValue.trim().length === 0) {
    errors.push('toValue should not be empty');
  } else if (payload.toValue.length > MAX_EVENT_TYPE_LENGTH) {
    errors.push(`toValue must be shorter than or equal to ${MAX_EVENT_TYPE_LENGTH} characters`);
  }

  return errors;
}
