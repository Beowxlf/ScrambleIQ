import type { CompetitorSide, PositionType, ReviewPresetScopeType } from '@scrambleiq/shared';

export interface UpdateSavedReviewPresetConfigDto {
  eventTypeFilters?: string[];
  competitorFilter?: CompetitorSide;
  positionFilters?: PositionType[];
  showOnlyValidationIssues?: boolean;
}

export class UpdateReviewPresetDto {
  name?: string;
  description?: string;
  scope?: ReviewPresetScopeType;
  config?: UpdateSavedReviewPresetConfigDto;
}
