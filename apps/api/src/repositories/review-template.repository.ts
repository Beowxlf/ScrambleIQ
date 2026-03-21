import type { ReviewChecklistItem, ReviewTemplate, ReviewTemplateMetadata, ReviewTemplateScopeType } from '@scrambleiq/shared';

export interface CreateReviewChecklistItemInput {
  label: string;
  description?: string;
  isRequired: boolean;
  sortOrder: number;
}

export interface CreateReviewTemplateInput {
  name: string;
  description?: string;
  scope: ReviewTemplateScopeType;
  checklistItems: CreateReviewChecklistItemInput[];
}

export interface UpdateReviewChecklistItemInput {
  label: string;
  description?: string;
  isRequired: boolean;
  sortOrder: number;
}

export interface UpdateReviewTemplateInput {
  name?: string;
  description?: string;
  scope?: ReviewTemplateScopeType;
  checklistItems?: UpdateReviewChecklistItemInput[];
}

export interface ReviewTemplateRepository {
  create(input: CreateReviewTemplateInput): Promise<ReviewTemplate>;
  findAllMetadata(): Promise<ReviewTemplateMetadata[]>;
  findById(id: string): Promise<ReviewTemplate | undefined>;
  update(id: string, input: UpdateReviewTemplateInput): Promise<ReviewTemplate | undefined>;
  delete(id: string): Promise<boolean>;
}

export const REVIEW_TEMPLATE_REPOSITORY = Symbol('REVIEW_TEMPLATE_REPOSITORY');

export function buildChecklistItems(items: CreateReviewChecklistItemInput[] | UpdateReviewChecklistItemInput[]): ReviewChecklistItem[] {
  return items.map((item) => ({
    id: crypto.randomUUID(),
    label: item.label,
    description: item.description,
    isRequired: item.isRequired,
    sortOrder: item.sortOrder,
  }));
}
