import type { CompetitorSide, PositionType, ReviewPresetScopeType, SavedReviewPreset, SavedReviewPresetMetadata } from '@scrambleiq/shared';

export interface SavedReviewPresetConfigInput {
  eventTypeFilters?: string[];
  competitorFilter?: CompetitorSide;
  positionFilters?: PositionType[];
  showOnlyValidationIssues?: boolean;
}

export interface CreateReviewPresetInput {
  name: string;
  description?: string;
  scope: ReviewPresetScopeType;
  config: SavedReviewPresetConfigInput;
}

export interface UpdateReviewPresetInput {
  name?: string;
  description?: string;
  scope?: ReviewPresetScopeType;
  config?: SavedReviewPresetConfigInput;
}

export interface ReviewPresetRepository {
  create(input: CreateReviewPresetInput): Promise<SavedReviewPreset>;
  findAllMetadata(): Promise<SavedReviewPresetMetadata[]>;
  findById(id: string): Promise<SavedReviewPreset | undefined>;
  update(id: string, input: UpdateReviewPresetInput): Promise<SavedReviewPreset | undefined>;
  delete(id: string): Promise<boolean>;
}

export const REVIEW_PRESET_REPOSITORY = Symbol('REVIEW_PRESET_REPOSITORY');
