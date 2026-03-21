import type { MatchesApi } from '../../matches-api';
import { AppliedReviewTemplate } from './AppliedReviewTemplate';
import { ReviewTemplateForm } from './ReviewTemplateForm';
import { ReviewTemplateList } from './ReviewTemplateList';
import { useReviewTemplates } from './useReviewTemplates';

interface ReviewTemplatePanelProps {
  api: MatchesApi;
}

export function ReviewTemplatePanel({ api }: ReviewTemplatePanelProps) {
  const {
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
  } = useReviewTemplates({ api });

  if (!hasApiSupport) {
    return (
      <section aria-labelledby="review-template-heading">
        <h2 id="review-template-heading">Review Templates</h2>
        <p>{templatesError}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="review-template-heading">
      <h2 id="review-template-heading">Review Templates</h2>
      <p>Build manual checklist templates and apply one to the active review session.</p>

      {!isTemplateFormVisible ? (
        <button type="button" onClick={startCreateTemplate}>
          Create Review Template
        </button>
      ) : null}

      {isTemplateFormVisible ? (
        <ReviewTemplateForm
          values={templateFormValues}
          errors={templateFormErrors}
          isSubmitting={isSubmittingTemplate}
          isEditing={editingTemplateId !== null}
          submissionError={templateSubmissionError}
          onChange={setTemplateFormValues}
          onSubmit={submitTemplate}
          onCancel={cancelTemplateForm}
          onAddChecklistItem={addChecklistItem}
          onRemoveChecklistItem={removeChecklistItem}
        />
      ) : null}

      {!isTemplateFormVisible && templateSubmissionError ? <p className="status-error">{templateSubmissionError}</p> : null}

      {isLoadingTemplates ? <p>Loading review templates...</p> : null}

      {!isLoadingTemplates ? (
        <ReviewTemplateList
          templates={templates}
          selectedTemplateId={selectedTemplate?.id ?? null}
          onSelectTemplate={(templateId) => void selectTemplate(templateId)}
          onEditTemplate={(templateId) => void startEditTemplate(templateId)}
          onDeleteTemplate={(templateId) => void deleteTemplate(templateId)}
          onApplyTemplate={(templateId) => void applyTemplate(templateId)}
          isApplyingTemplate={isSubmittingTemplate}
        />
      ) : null}

      {selectedTemplate ? (
        <article>
          <h3>Selected Template</h3>
          <p>{selectedTemplate.name}</p>
          <ul>
            {selectedTemplate.checklistItems
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => (
                <li key={item.id}>
                  {item.label} {item.isRequired ? '(required)' : '(optional)'}
                </li>
              ))}
          </ul>
        </article>
      ) : null}

      <AppliedReviewTemplate
        template={appliedTemplate}
        completionByItemId={appliedChecklistCompletion}
        onToggleChecklistItem={toggleAppliedChecklistItem}
        onClearAppliedTemplate={clearAppliedTemplate}
      />
    </section>
  );
}
