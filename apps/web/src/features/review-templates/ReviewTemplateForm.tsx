import { FormEvent } from 'react';

import type {
  ReviewTemplateFormValues,
  ReviewTemplateValidationErrors,
} from '../../review-template';

interface ReviewTemplateFormProps {
  values: ReviewTemplateFormValues;
  errors: ReviewTemplateValidationErrors;
  isSubmitting: boolean;
  isEditing: boolean;
  submissionError: string | null;
  onChange: (values: ReviewTemplateFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onAddChecklistItem: () => void;
  onRemoveChecklistItem: (id: string) => void;
}

export function ReviewTemplateForm({
  values,
  errors,
  isSubmitting,
  isEditing,
  submissionError,
  onChange,
  onSubmit,
  onCancel,
  onAddChecklistItem,
  onRemoveChecklistItem,
}: ReviewTemplateFormProps) {
  return (
    <form onSubmit={onSubmit} aria-label={isEditing ? 'Edit review template form' : 'Create review template form'}>
      <label htmlFor="template-name">Template Name</label>
      <input
        id="template-name"
        name="name"
        value={values.name}
        onChange={(event) => onChange({ ...values, name: event.target.value })}
      />
      {errors.name ? <p className="status-error">{errors.name}</p> : null}

      <label htmlFor="template-description">Template Description</label>
      <textarea
        id="template-description"
        name="description"
        value={values.description}
        onChange={(event) => onChange({ ...values, description: event.target.value })}
      />
      {errors.description ? <p className="status-error">{errors.description}</p> : null}

      <fieldset>
        <legend>Checklist Items</legend>
        {errors.checklistItems ? <p className="status-error">{errors.checklistItems}</p> : null}

        {values.checklistItems.map((item, index) => (
          <article key={item.id}>
            <h4>Item {index + 1}</h4>
            <label htmlFor={`checklist-item-label-${item.id}`}>Label</label>
            <input
              id={`checklist-item-label-${item.id}`}
              value={item.label}
              onChange={(event) => {
                const nextItems = [...values.checklistItems];
                nextItems[index] = { ...nextItems[index], label: event.target.value };
                onChange({ ...values, checklistItems: nextItems });
              }}
            />
            {errors.checklistItemErrors[index]?.label ? <p className="status-error">{errors.checklistItemErrors[index].label}</p> : null}

            <label htmlFor={`checklist-item-description-${item.id}`}>Item Description</label>
            <textarea
              id={`checklist-item-description-${item.id}`}
              value={item.description}
              onChange={(event) => {
                const nextItems = [...values.checklistItems];
                nextItems[index] = { ...nextItems[index], description: event.target.value };
                onChange({ ...values, checklistItems: nextItems });
              }}
            />
            {errors.checklistItemErrors[index]?.description ? <p className="status-error">{errors.checklistItemErrors[index].description}</p> : null}

            <label>
              <input
                type="checkbox"
                checked={item.isRequired}
                onChange={(event) => {
                  const nextItems = [...values.checklistItems];
                  nextItems[index] = { ...nextItems[index], isRequired: event.target.checked };
                  onChange({ ...values, checklistItems: nextItems });
                }}
              />
              Required item
            </label>

            <button
              type="button"
              onClick={() => onRemoveChecklistItem(item.id)}
              disabled={values.checklistItems.length <= 1 || isSubmitting}
            >
              Remove Item
            </button>
          </article>
        ))}

        <button type="button" onClick={onAddChecklistItem} disabled={isSubmitting}>
          Add Checklist Item
        </button>
      </fieldset>

      <p>Scope: single_match_review</p>

      {submissionError ? <p className="status-error">{submissionError}</p> : null}

      <div>
        <button type="submit" disabled={isSubmitting}>
          {isEditing ? 'Save Template' : 'Create Template'}
        </button>
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
