import type { ReviewTemplateScopeType } from '@scrambleiq/shared';

export interface UpdateReviewChecklistItemDto {
  label: string;
  description?: string;
  isRequired: boolean;
  sortOrder: number;
}

export class UpdateReviewTemplateDto {
  name?: string;
  description?: string;
  scope?: ReviewTemplateScopeType;
  checklistItems?: UpdateReviewChecklistItemDto[];
}
