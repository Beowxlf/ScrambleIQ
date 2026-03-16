import type { CreateMatchDto } from '@scrambleiq/shared';
import {
  MAX_COMPETITOR_NAME_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_RULESET_LENGTH,
  MAX_TITLE_LENGTH,
} from '@scrambleiq/shared';

export type MatchFormValues = Required<CreateMatchDto>;

export interface MatchValidationErrors {
  title?: string;
  date?: string;
  ruleset?: string;
  competitorA?: string;
  competitorB?: string;
  notes?: string;
}

export function validateMatchForm(values: MatchFormValues): MatchValidationErrors {
  const errors: MatchValidationErrors = {};

  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  } else if (values.title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  if (!values.date.trim()) {
    errors.date = 'Date is required.';
  }

  if (!values.ruleset.trim()) {
    errors.ruleset = 'Ruleset is required.';
  } else if (values.ruleset.length > MAX_RULESET_LENGTH) {
    errors.ruleset = `Ruleset must be ${MAX_RULESET_LENGTH} characters or fewer.`;
  }

  if (!values.competitorA.trim()) {
    errors.competitorA = 'Competitor A is required.';
  } else if (values.competitorA.length > MAX_COMPETITOR_NAME_LENGTH) {
    errors.competitorA = `Competitor A must be ${MAX_COMPETITOR_NAME_LENGTH} characters or fewer.`;
  }

  if (!values.competitorB.trim()) {
    errors.competitorB = 'Competitor B is required.';
  } else if (values.competitorB.length > MAX_COMPETITOR_NAME_LENGTH) {
    errors.competitorB = `Competitor B must be ${MAX_COMPETITOR_NAME_LENGTH} characters or fewer.`;
  }

  if (values.notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `Notes must be ${MAX_NOTES_LENGTH} characters or fewer.`;
  }

  return errors;
}

export function hasValidationErrors(errors: MatchValidationErrors): boolean {
  return Object.values(errors).some(Boolean);
}
