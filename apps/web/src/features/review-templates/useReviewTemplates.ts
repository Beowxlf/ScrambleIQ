import { FormEvent, useEffect, useMemo, useState } from 'react';

import type { ReviewChecklistItem, ReviewTemplate, ReviewTemplateMetadata } from '@scrambleiq/shared';

import {
  HttpRequestError,
  ReviewTemplateNotFoundError,
  type MatchesApi,
} from '../../matches-api';
import {
  createChecklistItemInput,
  hasReviewTemplateValidationErrors,
  initialReviewTemplateFormValues,
  type ReviewTemplateFormValues,
  type ReviewTemplateValidationErrors,
  toCreateReviewTemplateDto,
  toUpdateReviewTemplateDto,
  validateReviewTemplateForm,
} from '../../review-template';

interface UseReviewTemplatesArgs {
  api: MatchesApi;
}

function toFormValues(template: ReviewTemplate): ReviewTemplateFormValues {
  return {
    name: template.name,
    description: template.description ?? '',
    checklistItems: template.checklistItems
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        id: item.id,
        label: item.label,
        description: item.description ?? '',
        isRequired: item.isRequired,
      })),
  };
}

function toAppliedChecklist(template: ReviewTemplate): Record<string, boolean> {
  return template.checklistItems.reduce<Record<string, boolean>>((accumulator, item) => {
    accumulator[item.id] = false;
    return accumulator;
  }, {});
}

function isReviewTemplateApiAvailable(api: MatchesApi): boolean {
  return Boolean(
    api.listReviewTemplates
      && api.getReviewTemplate
      && api.createReviewTemplate
      && api.updateReviewTemplate
      && api.deleteReviewTemplate,
  );
}

export function useReviewTemplates({ api }: UseReviewTemplatesArgs) {
  const [templates, setTemplates] = useState<ReviewTemplateMetadata[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [isTemplateFormVisible, setIsTemplateFormVisible] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReviewTemplate | null>(null);
  const [templateFormValues, setTemplateFormValues] = useState<ReviewTemplateFormValues>(initialReviewTemplateFormValues);
  const [templateFormErrors, setTemplateFormErrors] = useState<ReviewTemplateValidationErrors>({ checklistItemErrors: [{}] });
  const [templateSubmissionError, setTemplateSubmissionError] = useState<string | null>(null);
  const [isSubmittingTemplate, setIsSubmittingTemplate] = useState(false);
  const [appliedTemplate, setAppliedTemplate] = useState<ReviewTemplate | null>(null);
  const [appliedChecklistCompletion, setAppliedChecklistCompletion] = useState<Record<string, boolean>>({});

  const hasApiSupport = useMemo(() => isReviewTemplateApiAvailable(api), [api]);

  useEffect(() => {
    const listReviewTemplates = api.listReviewTemplates;

    if (!hasApiSupport || !listReviewTemplates) {
      setIsLoadingTemplates(false);
      setTemplatesError('Review template APIs are unavailable in the current runtime.');
      return;
    }

    let isMounted = true;

    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      setTemplatesError(null);
      try {
        const listedTemplates = await listReviewTemplates();

        if (isMounted) {
          setTemplates(listedTemplates);
        }
      } catch {
        if (isMounted) {
          setTemplatesError('Unable to load review templates right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingTemplates(false);
        }
      }
    };

    void loadTemplates();

    return () => {
      isMounted = false;
    };
  }, [api, hasApiSupport]);

  const startCreateTemplate = () => {
    setIsTemplateFormVisible(true);
    setEditingTemplateId(null);
    setTemplateFormValues(initialReviewTemplateFormValues);
    setTemplateFormErrors({ checklistItemErrors: [{}] });
    setTemplateSubmissionError(null);
  };

  const addChecklistItem = () => {
    const nextIndex = templateFormValues.checklistItems.length;
    setTemplateFormValues({
      ...templateFormValues,
      checklistItems: [...templateFormValues.checklistItems, createChecklistItemInput(`new-item-${nextIndex}`)],
    });
    setTemplateFormErrors(validateReviewTemplateForm({
      ...templateFormValues,
      checklistItems: [...templateFormValues.checklistItems, createChecklistItemInput(`new-item-${nextIndex}`)],
    }));
  };

  const removeChecklistItem = (itemId: string) => {
    const nextItems = templateFormValues.checklistItems.filter((item) => item.id !== itemId);

    if (nextItems.length === 0) {
      return;
    }

    setTemplateFormValues({ ...templateFormValues, checklistItems: nextItems });
    setTemplateFormErrors(validateReviewTemplateForm({ ...templateFormValues, checklistItems: nextItems }));
  };

  const selectTemplate = async (templateId: string) => {
    if (!api.getReviewTemplate) {
      return;
    }

    setTemplateSubmissionError(null);

    try {
      const template = await api.getReviewTemplate(templateId);
      setSelectedTemplate(template);
      setEditingTemplateId(null);
      setIsTemplateFormVisible(false);
    } catch (error) {
      if (error instanceof ReviewTemplateNotFoundError) {
        setTemplates((currentTemplates) => currentTemplates.filter((template) => template.id !== templateId));
        setTemplateSubmissionError('This template no longer exists. The template list has been refreshed.');
        return;
      }

      setTemplateSubmissionError('Unable to load review template details right now.');
    }
  };

  const startEditTemplate = async (templateId: string) => {
    if (!api.getReviewTemplate) {
      return;
    }

    setTemplateSubmissionError(null);

    try {
      const template = await api.getReviewTemplate(templateId);
      setSelectedTemplate(template);
      setEditingTemplateId(template.id);
      setTemplateFormValues(toFormValues(template));
      setTemplateFormErrors({ checklistItemErrors: template.checklistItems.map(() => ({})) });
      setIsTemplateFormVisible(true);
    } catch (error) {
      if (error instanceof ReviewTemplateNotFoundError) {
        setTemplates((currentTemplates) => currentTemplates.filter((currentTemplate) => currentTemplate.id !== templateId));
        setTemplateSubmissionError('This template no longer exists. The template list has been refreshed.');
        return;
      }

      setTemplateSubmissionError('Unable to load review template details right now.');
    }
  };

  const submitTemplate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!api.createReviewTemplate || !api.updateReviewTemplate) {
      return;
    }

    const validationErrors = validateReviewTemplateForm(templateFormValues);
    setTemplateFormErrors(validationErrors);

    if (hasReviewTemplateValidationErrors(validationErrors)) {
      return;
    }

    setIsSubmittingTemplate(true);
    setTemplateSubmissionError(null);

    try {
      if (editingTemplateId) {
        const updatedTemplate = await api.updateReviewTemplate(editingTemplateId, toUpdateReviewTemplateDto(templateFormValues));

        setTemplates((currentTemplates) =>
          currentTemplates
            .map((template) =>
              template.id === updatedTemplate.id
                ? {
                  ...template,
                  name: updatedTemplate.name,
                  description: updatedTemplate.description,
                  checklistItemCount: updatedTemplate.checklistItems.length,
                  updatedAt: updatedTemplate.updatedAt,
                }
                : template,
            ),
        );
        setSelectedTemplate(updatedTemplate);
      } else {
        const createdTemplate = await api.createReviewTemplate(toCreateReviewTemplateDto(templateFormValues));

        setTemplates((currentTemplates) => [
          ...currentTemplates,
          {
            id: createdTemplate.id,
            name: createdTemplate.name,
            description: createdTemplate.description,
            scope: createdTemplate.scope,
            checklistItemCount: createdTemplate.checklistItems.length,
            createdAt: createdTemplate.createdAt,
            updatedAt: createdTemplate.updatedAt,
          },
        ]);

        setSelectedTemplate(createdTemplate);
      }

      setIsTemplateFormVisible(false);
      setEditingTemplateId(null);
      setTemplateFormValues(initialReviewTemplateFormValues);
      setTemplateFormErrors({ checklistItemErrors: [{}] });
    } catch (error) {
      if (error instanceof ReviewTemplateNotFoundError) {
        setTemplates((currentTemplates) => currentTemplates.filter((template) => template.id !== editingTemplateId));
        setTemplateSubmissionError('This template no longer exists. The template list has been refreshed.');
        return;
      }

      if (error instanceof HttpRequestError) {
        setTemplateSubmissionError(error.message);
        return;
      }

      setTemplateSubmissionError('Unable to save review template. Please try again.');
    } finally {
      setIsSubmittingTemplate(false);
    }
  };

  const cancelTemplateForm = () => {
    setIsTemplateFormVisible(false);
    setEditingTemplateId(null);
    setTemplateFormValues(initialReviewTemplateFormValues);
    setTemplateFormErrors({ checklistItemErrors: [{}] });
    setTemplateSubmissionError(null);
  };

  const deleteTemplate = async (templateId: string) => {
    if (!api.deleteReviewTemplate) {
      return;
    }

    setTemplateSubmissionError(null);

    try {
      await api.deleteReviewTemplate(templateId);
      setTemplates((currentTemplates) => currentTemplates.filter((template) => template.id !== templateId));

      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }

      if (appliedTemplate?.id === templateId) {
        setAppliedTemplate(null);
        setAppliedChecklistCompletion({});
      }
    } catch (error) {
      if (error instanceof ReviewTemplateNotFoundError) {
        setTemplates((currentTemplates) => currentTemplates.filter((template) => template.id !== templateId));
        setTemplateSubmissionError('This template no longer exists. The template list has been refreshed.');
        return;
      }

      setTemplateSubmissionError('Unable to delete review template. Please try again.');
    }
  };

  const applyTemplate = async (templateId: string) => {
    if (!api.getReviewTemplate) {
      return;
    }

    setTemplateSubmissionError(null);

    try {
      const template = await api.getReviewTemplate(templateId);
      const checklistItems: ReviewChecklistItem[] = template.checklistItems.slice().sort((a, b) => a.sortOrder - b.sortOrder);
      const normalizedTemplate: ReviewTemplate = { ...template, checklistItems };

      setAppliedTemplate(normalizedTemplate);
      setAppliedChecklistCompletion(toAppliedChecklist(normalizedTemplate));
      setSelectedTemplate(normalizedTemplate);
    } catch (error) {
      if (error instanceof ReviewTemplateNotFoundError) {
        setTemplates((currentTemplates) => currentTemplates.filter((currentTemplate) => currentTemplate.id !== templateId));
        setTemplateSubmissionError('Unable to apply template because it no longer exists.');
        return;
      }

      setTemplateSubmissionError('Unable to apply review template right now.');
    }
  };

  const toggleAppliedChecklistItem = (itemId: string) => {
    setAppliedChecklistCompletion((currentState) => ({
      ...currentState,
      [itemId]: !currentState[itemId],
    }));
  };

  const clearAppliedTemplate = () => {
    setAppliedTemplate(null);
    setAppliedChecklistCompletion({});
  };

  return {
    templates,
    isLoadingTemplates,
    templatesError,
    isTemplateFormVisible,
    editingTemplateId,
    selectedTemplate,
    templateFormValues,
    templateFormErrors,
    templateSubmissionError,
    isSubmittingTemplate,
    appliedTemplate,
    appliedChecklistCompletion,
    hasApiSupport,
    setTemplateFormValues,
    startCreateTemplate,
    addChecklistItem,
    removeChecklistItem,
    selectTemplate,
    startEditTemplate,
    submitTemplate,
    cancelTemplateForm,
    deleteTemplate,
    applyTemplate,
    toggleAppliedChecklistItem,
    clearAppliedTemplate,
  };
}
