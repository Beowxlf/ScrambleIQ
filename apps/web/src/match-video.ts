import {
  MATCH_VIDEO_SOURCE_TYPES,
  MAX_NOTES_LENGTH,
  MAX_SOURCE_URL_LENGTH,
  MAX_TITLE_LENGTH,
  type CreateMatchVideoDto,
  type MatchVideoSourceType,
} from '@scrambleiq/shared';

export type MatchVideoFormValues = {
  title: string;
  sourceType: '' | MatchVideoSourceType;
  sourceUrl: string;
  durationSeconds: string;
  notes: string;
};

export interface MatchVideoValidationErrors {
  title?: string;
  sourceType?: string;
  sourceUrl?: string;
  durationSeconds?: string;
  notes?: string;
}

export const initialMatchVideoValues: MatchVideoFormValues = {
  title: '',
  sourceType: '',
  sourceUrl: '',
  durationSeconds: '',
  notes: '',
};

export { MATCH_VIDEO_SOURCE_TYPES };

export function validateMatchVideoForm(values: MatchVideoFormValues): MatchVideoValidationErrors {
  const errors: MatchVideoValidationErrors = {};

  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  } else if (values.title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  if (!values.sourceType || MATCH_VIDEO_SOURCE_TYPES.includes(values.sourceType) === false) {
    errors.sourceType = 'Source type is required.';
  }

  if (!values.sourceUrl.trim()) {
    errors.sourceUrl = 'Source URL is required.';
  } else if (values.sourceUrl.length > MAX_SOURCE_URL_LENGTH) {
    errors.sourceUrl = `Source URL must be ${MAX_SOURCE_URL_LENGTH} characters or fewer.`;
  }

  if (values.durationSeconds.trim()) {
    const parsed = Number(values.durationSeconds);

    if (Number.isInteger(parsed) === false || parsed < 0) {
      errors.durationSeconds = 'Duration must be a non-negative integer.';
    }
  }

  if (values.notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `Notes must be ${MAX_NOTES_LENGTH} characters or fewer.`;
  }

  return errors;
}

export function hasMatchVideoValidationErrors(errors: MatchVideoValidationErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function toCreateMatchVideoDto(values: MatchVideoFormValues): CreateMatchVideoDto {
  return {
    title: values.title,
    sourceType: values.sourceType as MatchVideoSourceType,
    sourceUrl: values.sourceUrl,
    durationSeconds: values.durationSeconds ? Number(values.durationSeconds) : undefined,
    notes: values.notes || undefined,
  };
}
