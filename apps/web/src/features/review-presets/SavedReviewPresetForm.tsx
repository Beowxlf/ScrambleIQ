import { FormEvent } from 'react';

import { POSITION_TYPES, type SavedReviewPresetConfig } from '@scrambleiq/shared';

import type { ReviewPresetFormValues, ReviewPresetValidationErrors } from '../../review-preset';

interface SavedReviewPresetFormProps {
  values: ReviewPresetFormValues;
  errors: ReviewPresetValidationErrors;
  isSubmitting: boolean;
  isEditing: boolean;
  submissionError: string | null;
  onChange: (values: ReviewPresetFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

interface ReviewSettingsFormProps {
  values: ReviewPresetFormValues;
  activePresetName: string | null;
  onChange: (values: SavedReviewPresetConfig) => void;
}

export function ReviewSettingsForm({ values, activePresetName, onChange }: ReviewSettingsFormProps) {
  const currentConfig: SavedReviewPresetConfig = {
    eventTypeFilters: values.eventTypeFiltersText
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
    competitorFilter: values.competitorFilter || undefined,
    positionFilters: values.positionFilters,
    showOnlyValidationIssues: values.showOnlyValidationIssues,
  };

  return (
    <section aria-labelledby="active-review-settings-heading">
      <h3 id="active-review-settings-heading">Active Review Settings</h3>
      <p>
        {activePresetName
          ? `Current settings are from preset: ${activePresetName}.`
          : 'Current settings are manually selected for this review session.'}
      </p>

      <label htmlFor="active-event-type-filters">Event type filters (comma-separated)</label>
      <input
        id="active-event-type-filters"
        value={values.eventTypeFiltersText}
        onChange={(event) => onChange({ ...currentConfig, eventTypeFilters: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) })}
      />

      <label htmlFor="active-competitor-filter">Competitor filter</label>
      <select
        id="active-competitor-filter"
        value={values.competitorFilter}
        onChange={(event) => onChange({ ...currentConfig, competitorFilter: event.target.value === '' ? undefined : event.target.value as 'A' | 'B' })}
      >
        <option value="">All competitors</option>
        <option value="A">Competitor A</option>
        <option value="B">Competitor B</option>
      </select>

      <fieldset>
        <legend>Position filters</legend>
        {POSITION_TYPES.map((position) => {
          const isChecked = values.positionFilters.includes(position);
          return (
            <label key={position}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(event) => {
                  const nextPositions = event.target.checked
                    ? [...values.positionFilters, position]
                    : values.positionFilters.filter((current) => current !== position);
                  onChange({ ...currentConfig, positionFilters: nextPositions.length > 0 ? nextPositions : undefined });
                }}
              />
              {position}
            </label>
          );
        })}
      </fieldset>

      <label>
        <input
          type="checkbox"
          checked={values.showOnlyValidationIssues}
          onChange={(event) => onChange({ ...currentConfig, showOnlyValidationIssues: event.target.checked })}
        />
        Show only validation issues in review context
      </label>
    </section>
  );
}

export function SavedReviewPresetForm({
  values,
  errors,
  isSubmitting,
  isEditing,
  submissionError,
  onChange,
  onSubmit,
  onCancel,
}: SavedReviewPresetFormProps) {
  return (
    <form onSubmit={onSubmit} aria-label={isEditing ? 'Edit saved review preset form' : 'Create saved review preset form'}>
      <label htmlFor="preset-name">Preset Name</label>
      <input id="preset-name" value={values.name} onChange={(event) => onChange({ ...values, name: event.target.value })} />
      {errors.name ? <p className="status-error">{errors.name}</p> : null}

      <label htmlFor="preset-description">Preset Description</label>
      <textarea
        id="preset-description"
        value={values.description}
        onChange={(event) => onChange({ ...values, description: event.target.value })}
      />
      {errors.description ? <p className="status-error">{errors.description}</p> : null}

      <label htmlFor="preset-event-type-filters">Event type filters (comma-separated)</label>
      <input
        id="preset-event-type-filters"
        value={values.eventTypeFiltersText}
        onChange={(event) => onChange({ ...values, eventTypeFiltersText: event.target.value })}
      />
      {errors.eventTypeFiltersText ? <p className="status-error">{errors.eventTypeFiltersText}</p> : null}

      <label htmlFor="preset-competitor-filter">Competitor filter</label>
      <select
        id="preset-competitor-filter"
        value={values.competitorFilter}
        onChange={(event) => onChange({ ...values, competitorFilter: event.target.value as 'A' | 'B' | '' })}
      >
        <option value="">All competitors</option>
        <option value="A">Competitor A</option>
        <option value="B">Competitor B</option>
      </select>

      <fieldset>
        <legend>Position filters</legend>
        {POSITION_TYPES.map((position) => {
          const isChecked = values.positionFilters.includes(position);
          return (
            <label key={position}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(event) => {
                  const nextPositions = event.target.checked
                    ? [...values.positionFilters, position]
                    : values.positionFilters.filter((current) => current !== position);

                  onChange({ ...values, positionFilters: nextPositions });
                }}
              />
              {position}
            </label>
          );
        })}
      </fieldset>

      <label>
        <input
          type="checkbox"
          checked={values.showOnlyValidationIssues}
          onChange={(event) => onChange({ ...values, showOnlyValidationIssues: event.target.checked })}
        />
        Show only validation issues in review context
      </label>

      <p>Scope: match_detail</p>

      {submissionError ? <p className="status-error">{submissionError}</p> : null}

      <div>
        <button type="submit" disabled={isSubmitting}>
          {isEditing ? 'Save Preset' : 'Create Preset'}
        </button>
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
