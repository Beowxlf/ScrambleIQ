import type { FormEvent } from 'react';

import type { MatchVideoFormValues, MatchVideoValidationErrors } from '../../match-video';
import { MATCH_VIDEO_SOURCE_TYPES } from '../../match-video';

interface VideoMetadataFormProps {
  values: MatchVideoFormValues;
  errors: MatchVideoValidationErrors;
  isSubmitting: boolean;
  isEditing: boolean;
  submissionError: string | null;
  onChange: (nextValues: MatchVideoFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function VideoMetadataForm({
  values,
  errors,
  isSubmitting,
  isEditing,
  submissionError,
  onChange,
  onSubmit,
  onCancel,
}: VideoMetadataFormProps) {
  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate>
      <h3>{isEditing ? 'Edit Video' : 'Attach Video'}</h3>

      <label htmlFor="video-title">Title</label>
      <input id="video-title" name="title" value={values.title} onChange={(event) => onChange({ ...values, title: event.target.value })} />
      {errors.title ? <p className="form-error">{errors.title}</p> : null}

      <label htmlFor="video-source-type">Source Type</label>
      <select
        id="video-source-type"
        name="sourceType"
        value={values.sourceType}
        onChange={(event) => onChange({ ...values, sourceType: event.target.value as MatchVideoFormValues['sourceType'] })}
      >
        <option value="">Select source type</option>
        {MATCH_VIDEO_SOURCE_TYPES.map((sourceType) => (
          <option key={sourceType} value={sourceType}>
            {sourceType}
          </option>
        ))}
      </select>
      {errors.sourceType ? <p className="form-error">{errors.sourceType}</p> : null}

      <label htmlFor="video-source-url">Source URL</label>
      <input id="video-source-url" name="sourceUrl" value={values.sourceUrl} onChange={(event) => onChange({ ...values, sourceUrl: event.target.value })} />
      {errors.sourceUrl ? <p className="form-error">{errors.sourceUrl}</p> : null}

      <label htmlFor="video-duration">Duration (seconds)</label>
      <input
        id="video-duration"
        name="durationSeconds"
        value={values.durationSeconds}
        onChange={(event) => onChange({ ...values, durationSeconds: event.target.value })}
      />
      {errors.durationSeconds ? <p className="form-error">{errors.durationSeconds}</p> : null}

      <label htmlFor="video-notes">Notes</label>
      <textarea id="video-notes" name="notes" value={values.notes} onChange={(event) => onChange({ ...values, notes: event.target.value })} />

      <div className="button-row">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Video' : 'Attach Video'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {submissionError ? <p className="status-error">{submissionError}</p> : null}
    </form>
  );
}
