import { KeyboardEvent } from 'react';
import type { FormEvent } from 'react';

import { TimelineEventFormValues, TimelineEventValidationErrors } from '../../timeline-event';

interface EventFormProps {
  values: TimelineEventFormValues;
  errors: TimelineEventValidationErrors;
  isSubmitting: boolean;
  isEditing: boolean;
  submissionError: string | null;
  onChange: (values: TimelineEventFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCancel: () => void;
}

export function EventForm({ values, errors, isSubmitting, isEditing, submissionError, onChange, onSubmit, onCancel }: EventFormProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.requestSubmit();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  };

  return (
    <form onSubmit={(event) => void onSubmit(event)} onKeyDown={handleKeyDown} noValidate>
      <h3>{isEditing ? 'Edit Event' : 'Add Event'}</h3>

      <label htmlFor="event-timestamp">Timestamp (seconds)</label>
      <input
        id="event-timestamp"
        name="timestamp"
        type="number"
        min={0}
        autoFocus
        value={values.timestamp}
        onChange={(event) => onChange({ ...values, timestamp: event.target.value })}
      />
      {errors.timestamp ? <p>{errors.timestamp}</p> : null}

      <label htmlFor="event-type">Event Type</label>
      <input
        id="event-type"
        name="eventType"
        value={values.eventType}
        onChange={(event) => onChange({ ...values, eventType: event.target.value })}
      />
      {errors.eventType ? <p>{errors.eventType}</p> : null}

      <label htmlFor="event-competitor">Competitor</label>
      <select
        id="event-competitor"
        name="competitor"
        value={values.competitor}
        onChange={(event) => onChange({ ...values, competitor: event.target.value as '' | 'A' | 'B' })}
      >
        <option value="">Select competitor</option>
        <option value="A">A</option>
        <option value="B">B</option>
      </select>
      {errors.competitor ? <p>{errors.competitor}</p> : null}

      <label htmlFor="event-notes">Notes</label>
      <textarea id="event-notes" name="notes" value={values.notes} onChange={(event) => onChange({ ...values, notes: event.target.value })} />

      <p>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Event' : 'Create Event'}
        </button>{' '}
        {!isEditing ? (
          <button type="submit" name="submitMode" value="addAnother" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create & Add Another'}
          </button>
        ) : null}{' '}
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </p>
      {submissionError ? <p>{submissionError}</p> : null}
    </form>
  );
}
