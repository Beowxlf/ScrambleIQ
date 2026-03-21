import type { ReviewTemplateScopeType } from '@scrambleiq/shared';
import { MAX_NOTES_LENGTH, MAX_TITLE_LENGTH } from '@scrambleiq/shared';

export interface ReviewTemplateChecklistItemInput {
  id: string;
  label: string;
  description: string;
  isRequired: boolean;
}

export interface ReviewTemplateFormValues {
  name: string;
  description: string;
  checklistItems: ReviewTemplateChecklistItemInput[];
}

export interface ReviewTemplateValidationErrors {
  name?: string;
  description?: string;
  checklistItems?: string;
  checklistItemErrors: Array<{
    label?: string;
    description?: string;
  }>;
}

export interface CreateReviewTemplateDto {
  name: string;
  description?: string;
  scope: ReviewTemplateScopeType;
  checklistItems: Array<{
    label: string;
    description?: string;
    isRequired: boolean;
    sortOrder: number;
  }>;
}

export type UpdateReviewTemplateDto = Partial<CreateReviewTemplateDto>;

export const REVIEW_TEMPLATE_SCOPE: ReviewTemplateScopeType = 'single_match_review';

export const initialReviewTemplateFormValues: ReviewTemplateFormValues = {
  name: '',
  description: '',
  checklistItems: [
    {
      id: 'new-item-0',
      label: '',
      description: '',
      isRequired: true,
    },
  ],
};

export function createChecklistItemInput(id: string): ReviewTemplateChecklistItemInput {
  return {
    id,
    label: '',
    description: '',
    isRequired: true,
  };
}

export function validateReviewTemplateForm(values: ReviewTemplateFormValues): ReviewTemplateValidationErrors {
  const errors: ReviewTemplateValidationErrors = {
    checklistItemErrors: values.checklistItems.map(() => ({})),
  };

  if (!values.name.trim()) {
    errors.name = 'Template name is required.';
  } else if (values.name.length > MAX_TITLE_LENGTH) {
    errors.name = `Template name must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  if (values.description.length > MAX_NOTES_LENGTH) {
    errors.description = `Description must be ${MAX_NOTES_LENGTH} characters or fewer.`;
  }

  if (values.checklistItems.length === 0) {
    errors.checklistItems = 'At least one checklist item is required.';
    return errors;
  }

  const normalizedLabels = new Set<string>();

  values.checklistItems.forEach((item, index) => {
    if (!item.label.trim()) {
      errors.checklistItemErrors[index].label = 'Checklist item label is required.';
      return;
    }

    if (item.label.length > MAX_TITLE_LENGTH) {
      errors.checklistItemErrors[index].label = `Checklist item label must be ${MAX_TITLE_LENGTH} characters or fewer.`;
      return;
    }

    const normalizedLabel = item.label.trim().toLowerCase();
    if (normalizedLabels.has(normalizedLabel)) {
      errors.checklistItemErrors[index].label = 'Checklist item labels must be unique.';
      return;
    }

    normalizedLabels.add(normalizedLabel);

    if (item.description.length > MAX_NOTES_LENGTH) {
      errors.checklistItemErrors[index].description = `Checklist item description must be ${MAX_NOTES_LENGTH} characters or fewer.`;
    }
  });

  return errors;
}

export function hasReviewTemplateValidationErrors(errors: ReviewTemplateValidationErrors): boolean {
  return Boolean(
    errors.name
      || errors.description
      || errors.checklistItems
      || errors.checklistItemErrors.some((itemError) => itemError.label || itemError.description),
  );
}

export function toCreateReviewTemplateDto(values: ReviewTemplateFormValues): CreateReviewTemplateDto {
  return {
    name: values.name,
    description: values.description || undefined,
    scope: REVIEW_TEMPLATE_SCOPE,
    checklistItems: values.checklistItems.map((item, index) => ({
      label: item.label,
      description: item.description || undefined,
      isRequired: item.isRequired,
      sortOrder: index,
    })),
  };
}

export function toUpdateReviewTemplateDto(values: ReviewTemplateFormValues): UpdateReviewTemplateDto {
  return toCreateReviewTemplateDto(values);
}
