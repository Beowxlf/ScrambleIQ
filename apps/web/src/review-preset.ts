import type { CompetitorSide, PositionType, ReviewPresetScopeType, SavedReviewPresetConfig } from '@scrambleiq/shared';
import {
  MAX_EVENT_TYPE_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_TITLE_LENGTH,
  POSITION_TYPES,
} from '@scrambleiq/shared';

export interface ReviewPresetFormValues {
  name: string;
  description: string;
  eventTypeFiltersText: string;
  competitorFilter: CompetitorSide | '';
  positionFilters: PositionType[];
  showOnlyValidationIssues: boolean;
}

export interface ReviewPresetValidationErrors {
  name?: string;
  description?: string;
  eventTypeFiltersText?: string;
}

export interface CreateSavedReviewPresetDto {
  name: string;
  description?: string;
  scope: ReviewPresetScopeType;
  config: SavedReviewPresetConfig;
}

export type UpdateSavedReviewPresetDto = Partial<CreateSavedReviewPresetDto>;

export const REVIEW_PRESET_SCOPE: ReviewPresetScopeType = 'match_detail';

export const initialReviewPresetFormValues: ReviewPresetFormValues = {
  name: '',
  description: '',
  eventTypeFiltersText: '',
  competitorFilter: '',
  positionFilters: [],
  showOnlyValidationIssues: false,
};

export function toReviewPresetFormValues(input: {
  name: string;
  description?: string;
  config: SavedReviewPresetConfig;
}): ReviewPresetFormValues {
  return {
    name: input.name,
    description: input.description ?? '',
    eventTypeFiltersText: (input.config.eventTypeFilters ?? []).join(', '),
    competitorFilter: input.config.competitorFilter ?? '',
    positionFilters: input.config.positionFilters ?? [],
    showOnlyValidationIssues: input.config.showOnlyValidationIssues ?? false,
  };
}

function parseEventTypeFilters(eventTypeFiltersText: string): string[] {
  return eventTypeFiltersText
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function validateReviewPresetForm(values: ReviewPresetFormValues): ReviewPresetValidationErrors {
  const errors: ReviewPresetValidationErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Preset name is required.';
  } else if (values.name.length > MAX_TITLE_LENGTH) {
    errors.name = `Preset name must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  if (values.description.length > MAX_NOTES_LENGTH) {
    errors.description = `Description must be ${MAX_NOTES_LENGTH} characters or fewer.`;
  }

  const eventTypeFilters = parseEventTypeFilters(values.eventTypeFiltersText);
  const seenEventTypes = new Set<string>();

  eventTypeFilters.forEach((eventType) => {
    if (eventType.length > MAX_EVENT_TYPE_LENGTH) {
      errors.eventTypeFiltersText = `Each event type filter must be ${MAX_EVENT_TYPE_LENGTH} characters or fewer.`;
      return;
    }

    const normalized = eventType.toLowerCase();

    if (seenEventTypes.has(normalized)) {
      errors.eventTypeFiltersText = 'Event type filters must be unique.';
      return;
    }

    seenEventTypes.add(normalized);
  });

  if (values.positionFilters.some((position) => !POSITION_TYPES.includes(position))) {
    errors.eventTypeFiltersText = 'Position filters include an unknown position.';
  }

  return errors;
}

export function hasReviewPresetValidationErrors(errors: ReviewPresetValidationErrors): boolean {
  return Boolean(errors.name || errors.description || errors.eventTypeFiltersText);
}

export function toSavedReviewPresetConfig(values: ReviewPresetFormValues): SavedReviewPresetConfig {
  const eventTypeFilters = parseEventTypeFilters(values.eventTypeFiltersText);

  return {
    eventTypeFilters: eventTypeFilters.length > 0 ? eventTypeFilters : undefined,
    competitorFilter: values.competitorFilter || undefined,
    positionFilters: values.positionFilters.length > 0 ? values.positionFilters : undefined,
    showOnlyValidationIssues: values.showOnlyValidationIssues,
  };
}

export function toCreateSavedReviewPresetDto(values: ReviewPresetFormValues): CreateSavedReviewPresetDto {
  return {
    name: values.name,
    description: values.description || undefined,
    scope: REVIEW_PRESET_SCOPE,
    config: toSavedReviewPresetConfig(values),
  };
}

export function toUpdateSavedReviewPresetDto(values: ReviewPresetFormValues): UpdateSavedReviewPresetDto {
  return toCreateSavedReviewPresetDto(values);
}
