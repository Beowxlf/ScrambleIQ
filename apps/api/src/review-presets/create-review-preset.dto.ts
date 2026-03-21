import type { CompetitorSide, PositionType, ReviewPresetScopeType } from '@scrambleiq/shared';

export interface CreateSavedReviewPresetConfigDto {
  eventTypeFilters?: string[];
  competitorFilter?: CompetitorSide;
  positionFilters?: PositionType[];
  showOnlyValidationIssues?: boolean;
}

export class CreateReviewPresetDto {
  name!: string;
  description?: string;
  scope!: ReviewPresetScopeType;
  config!: CreateSavedReviewPresetConfigDto;
}
