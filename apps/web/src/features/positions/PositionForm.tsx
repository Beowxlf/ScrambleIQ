import type { FormEvent } from 'react';

import { POSITION_TYPES, PositionStateFormValues, PositionStateValidationErrors } from '../../position-state';

interface PositionFormProps {
  values: PositionStateFormValues;
  errors: PositionStateValidationErrors;
  isSubmitting: boolean;
  isEditing: boolean;
  submissionError: string | null;
  onChange: (values: PositionStateFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCancel: () => void;
}

export function PositionForm({ values, errors, isSubmitting, isEditing, submissionError, onChange, onSubmit, onCancel }: PositionFormProps) {
  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate className="siq-form" aria-busy={isSubmitting}>
      <div className="siq-form__header">
        <h3>{isEditing ? 'Edit Position' : 'Add Position'}</h3>
        <p className="siq-form__mode">{isEditing ? 'Editing existing position interval.' : 'Create a new position interval.'}</p>
      </div>

      <label htmlFor="position-type">Position</label>
      <select
        id="position-type"
        name="position"
        value={values.position}
        onChange={(event) => onChange({ ...values, position: event.target.value as PositionStateFormValues['position'] })}
      >
        <option value="">Select position</option>
        {POSITION_TYPES.map((positionType) => (
          <option key={positionType} value={positionType}>
            {positionType}
          </option>
        ))}
      </select>
      {errors.position ? <p className="form-error">{errors.position}</p> : null}

      <label htmlFor="position-competitor-top">Top Competitor</label>
      <select
        id="position-competitor-top"
        name="competitorTop"
        value={values.competitorTop}
        onChange={(event) => onChange({ ...values, competitorTop: event.target.value as PositionStateFormValues['competitorTop'] })}
      >
        <option value="">Select competitor</option>
        <option value="A">A</option>
        <option value="B">B</option>
      </select>
      {errors.competitorTop ? <p className="form-error">{errors.competitorTop}</p> : null}

      <label htmlFor="position-timestamp-start">Start Timestamp (seconds)</label>
      <input
        id="position-timestamp-start"
        name="timestampStart"
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        value={values.timestampStart}
        onChange={(event) => onChange({ ...values, timestampStart: event.target.value })}
      />
      {errors.timestampStart ? <p className="form-error">{errors.timestampStart}</p> : null}

      <label htmlFor="position-timestamp-end">End Timestamp (seconds)</label>
      <input
        id="position-timestamp-end"
        name="timestampEnd"
        type="number"
        min={1}
        step={1}
        inputMode="numeric"
        value={values.timestampEnd}
        onChange={(event) => onChange({ ...values, timestampEnd: event.target.value })}
      />
      {errors.timestampEnd ? <p className="form-error">{errors.timestampEnd}</p> : null}

      <div className="siq-form__group">
        <label htmlFor="position-notes">Notes</label>
        <textarea id="position-notes" name="notes" value={values.notes} onChange={(event) => onChange({ ...values, notes: event.target.value })} />
      </div>

      <div className="button-row">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Position' : 'Create Position'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      {submissionError ? <p className="status-error">{submissionError}</p> : null}
    </form>
  );
}
