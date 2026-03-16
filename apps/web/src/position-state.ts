import { MAX_NOTES_LENGTH, POSITION_TYPES, type CreatePositionStateDto } from '@scrambleiq/shared';

export type PositionStateFormValues = {
  position: '' | CreatePositionStateDto['position'];
  competitorTop: '' | 'A' | 'B';
  timestampStart: string;
  timestampEnd: string;
  notes: string;
};

export interface PositionStateValidationErrors {
  position?: string;
  competitorTop?: string;
  timestampStart?: string;
  timestampEnd?: string;
  notes?: string;
}

export const initialPositionStateValues: PositionStateFormValues = {
  position: '',
  competitorTop: '',
  timestampStart: '',
  timestampEnd: '',
  notes: '',
};

export { POSITION_TYPES };

export function validatePositionStateForm(values: PositionStateFormValues): PositionStateValidationErrors {
  const errors: PositionStateValidationErrors = {};

  if (!values.position || POSITION_TYPES.includes(values.position) === false) {
    errors.position = 'Position is required.';
  }

  if (values.competitorTop !== 'A' && values.competitorTop !== 'B') {
    errors.competitorTop = 'Top competitor is required.';
  }

  if (!values.timestampStart.trim()) {
    errors.timestampStart = 'Start timestamp is required.';
  } else {
    const parsed = Number(values.timestampStart);

    if (Number.isInteger(parsed) === false || parsed < 0) {
      errors.timestampStart = 'Start timestamp must be a non-negative integer.';
    }
  }

  if (!values.timestampEnd.trim()) {
    errors.timestampEnd = 'End timestamp is required.';
  } else {
    const parsed = Number(values.timestampEnd);

    if (Number.isInteger(parsed) === false) {
      errors.timestampEnd = 'End timestamp must be an integer greater than start timestamp.';
    }
  }

  if (!errors.timestampStart && !errors.timestampEnd) {
    const start = Number(values.timestampStart);
    const end = Number(values.timestampEnd);

    if (end <= start) {
      errors.timestampEnd = 'End timestamp must be greater than start timestamp.';
    }
  }

  if (values.notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `Notes must be ${MAX_NOTES_LENGTH} characters or fewer.`;
  }

  return errors;
}

export function hasPositionStateValidationErrors(errors: PositionStateValidationErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function toCreatePositionStateDto(values: PositionStateFormValues): CreatePositionStateDto {
  return {
    position: values.position as CreatePositionStateDto['position'],
    competitorTop: values.competitorTop as 'A' | 'B',
    timestampStart: Number(values.timestampStart),
    timestampEnd: Number(values.timestampEnd),
    notes: values.notes || undefined,
  };
}
