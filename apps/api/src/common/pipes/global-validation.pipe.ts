import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { CreateMatchDto } from '../../matches/create-match.dto';

@Injectable()
export class GlobalValidationPipe implements PipeTransform {
  transform(value: unknown): unknown {
    if (!isRecord(value) || !looksLikeCreateMatchPayload(value)) {
      return value;
    }

    const errors = validateCreateMatchDto(value);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return value as unknown as CreateMatchDto;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function looksLikeCreateMatchPayload(value: Record<string, unknown>): boolean {
  return ['title', 'date', 'ruleset', 'competitorA', 'competitorB', 'notes'].some((key) => key in value);
}

function validateCreateMatchDto(payload: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const requiredStringFields: Array<keyof CreateMatchDto> = ['title', 'date', 'ruleset', 'competitorA', 'competitorB'];

  for (const field of requiredStringFields) {
    if (!(field in payload)) {
      errors.push(`${field} should not be empty`);
      errors.push(`${field} must be a string`);
      continue;
    }

    if (typeof payload[field] !== 'string') {
      errors.push(`${field} must be a string`);
      continue;
    }

    if (payload[field].trim().length === 0) {
      errors.push(`${field} should not be empty`);
    }
  }

  if ('notes' in payload && payload.notes !== undefined && typeof payload.notes !== 'string') {
    errors.push('notes must be a string');
  }

  const allowedFields = new Set(['title', 'date', 'ruleset', 'competitorA', 'competitorB', 'notes']);

  for (const key of Object.keys(payload)) {
    if (!allowedFields.has(key)) {
      errors.push(`property ${key} should not exist`);
    }
  }

  return errors;
}
