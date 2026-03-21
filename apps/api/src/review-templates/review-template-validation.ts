import {
  MAX_NOTES_LENGTH,
  MAX_TITLE_LENGTH,
  REVIEW_TEMPLATE_SCOPE_TYPES,
  type ReviewTemplateScopeType,
} from '@scrambleiq/shared';

import type { CreateReviewTemplateDto } from './create-review-template.dto';
import type { UpdateReviewTemplateDto } from './update-review-template.dto';

const requiredFields = ['name', 'scope', 'checklistItems'] as const;
const optionalFields = ['description'] as const;
const checklistRequiredFields = ['label', 'isRequired', 'sortOrder'] as const;
const checklistOptionalFields = ['description'] as const;
const allAllowedFields = new Set([...requiredFields, ...optionalFields]);
const checklistAllowedFields = new Set([...checklistRequiredFields, ...checklistOptionalFields]);

export function validateCreateReviewTemplatePayload(payload: CreateReviewTemplateDto): string[] {
  const errors: string[] = [];
  const body = payload as unknown as Record<string, unknown>;

  validateRequiredName(body, errors);
  validateOptionalDescription(body, errors);
  validateRequiredScope(body, errors);
  validateRequiredChecklistItems(body, errors);
  validateAllowedFields(body, errors);

  return errors;
}

export function validateUpdateReviewTemplatePayload(payload: UpdateReviewTemplateDto): string[] {
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

  if ('checklistItems' in body) {
    validateChecklistItemsValue(body.checklistItems, errors);
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
    errors.push(`scope must be one of the following values: ${REVIEW_TEMPLATE_SCOPE_TYPES.join(', ')}`);
    return;
  }

  validateScopeValue(payload.scope, errors);
}

function validateScopeValue(value: unknown, errors: string[]): void {
  if (typeof value !== 'string' || REVIEW_TEMPLATE_SCOPE_TYPES.includes(value as ReviewTemplateScopeType) === false) {
    errors.push(`scope must be one of the following values: ${REVIEW_TEMPLATE_SCOPE_TYPES.join(', ')}`);
  }
}

function validateRequiredChecklistItems(payload: Record<string, unknown>, errors: string[]): void {
  if (!('checklistItems' in payload)) {
    errors.push('checklistItems should not be empty');
    errors.push('checklistItems must be an array');
    return;
  }

  validateChecklistItemsValue(payload.checklistItems, errors);
}

function validateChecklistItemsValue(value: unknown, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push('checklistItems must be an array');
    return;
  }

  if (value.length === 0) {
    errors.push('checklistItems should not be empty');
    return;
  }

  const usedSortOrders = new Set<number>();
  const normalizedLabels = new Set<string>();

  value.forEach((item, index) => {
    validateChecklistItem(item, index, errors, usedSortOrders, normalizedLabels);
  });
}

function validateChecklistItem(
  item: unknown,
  index: number,
  errors: string[],
  usedSortOrders: Set<number>,
  normalizedLabels: Set<string>,
): void {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    errors.push(`checklistItems[${index}] must be an object`);
    return;
  }

  const itemRecord = item as Record<string, unknown>;

  for (const field of checklistRequiredFields) {
    if (!(field in itemRecord)) {
      errors.push(`checklistItems[${index}].${field} should not be empty`);
    }
  }

  if ('label' in itemRecord) {
    if (typeof itemRecord.label !== 'string') {
      errors.push(`checklistItems[${index}].label must be a string`);
    } else if (itemRecord.label.trim().length === 0) {
      errors.push(`checklistItems[${index}].label should not be empty`);
    } else if (itemRecord.label.length > MAX_TITLE_LENGTH) {
      errors.push(`checklistItems[${index}].label must be shorter than or equal to ${MAX_TITLE_LENGTH} characters`);
    } else {
      const normalized = itemRecord.label.trim().toLowerCase();
      if (normalizedLabels.has(normalized)) {
        errors.push(`checklistItems[${index}].label must be unique`);
      } else {
        normalizedLabels.add(normalized);
      }
    }
  }

  if ('description' in itemRecord && itemRecord.description !== undefined) {
    if (typeof itemRecord.description !== 'string') {
      errors.push(`checklistItems[${index}].description must be a string`);
    } else if (itemRecord.description.length > MAX_NOTES_LENGTH) {
      errors.push(`checklistItems[${index}].description must be shorter than or equal to ${MAX_NOTES_LENGTH} characters`);
    }
  }

  if ('isRequired' in itemRecord && typeof itemRecord.isRequired !== 'boolean') {
    errors.push(`checklistItems[${index}].isRequired must be a boolean value`);
  }

  if ('sortOrder' in itemRecord) {
    if (
      typeof itemRecord.sortOrder !== 'number'
      || Number.isInteger(itemRecord.sortOrder) === false
      || Number.isFinite(itemRecord.sortOrder) === false
    ) {
      errors.push(`checklistItems[${index}].sortOrder must be a number conforming to the specified constraints`);
    } else if (itemRecord.sortOrder < 0) {
      errors.push(`checklistItems[${index}].sortOrder must not be less than 0`);
    } else if (usedSortOrders.has(itemRecord.sortOrder)) {
      errors.push(`checklistItems[${index}].sortOrder must be unique`);
    } else {
      usedSortOrders.add(itemRecord.sortOrder);
    }
  }

  for (const key of Object.keys(itemRecord)) {
    if (!checklistAllowedFields.has(key as (typeof checklistRequiredFields)[number])) {
      errors.push(`checklistItems[${index}] property ${key} should not exist`);
    }
  }
}

function validateAllowedFields(payload: Record<string, unknown>, errors: string[]): void {
  for (const key of Object.keys(payload)) {
    if (!allAllowedFields.has(key as (typeof requiredFields)[number])) {
      errors.push(`property ${key} should not exist`);
    }
  }
}
