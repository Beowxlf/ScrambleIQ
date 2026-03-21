import type { ReviewTemplateScopeType } from '@scrambleiq/shared';

export interface CreateReviewChecklistItemDto {
  label: string;
  description?: string;
  isRequired: boolean;
  sortOrder: number;
}

export class CreateReviewTemplateDto {
  name!: string;
  description?: string;
  scope!: ReviewTemplateScopeType;
  checklistItems!: CreateReviewChecklistItemDto[];
}
