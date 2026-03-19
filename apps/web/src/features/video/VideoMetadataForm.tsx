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
    <form onSubmit={(event) => void onSubmit(event)} noValidate className="siq-form" aria-busy={isSubmitting}>
      <div className="siq-form__header">
        <h3>{isEditing ? 'Edit Video' : 'Attach Video'}</h3>
        <p className="siq-form__mode">{isEditing ? 'Editing attached video metadata.' : 'Attach a video and add metadata.'}</p>
      </div>

      <div className="siq-form__group">
        <label htmlFor="video-title">Title</label>
        <input
          id="video-title"
          name="title"
          value={values.title}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'video-title-error' : undefined}
          onChange={(event) => onChange({ ...values, title: event.target.value })}
        />
        {errors.title ? (
          <p id="video-title-error" className="siq-form__error" role="alert">
            {errors.title}
          </p>
        ) : null}
      </div>

      <div className="siq-form__group">
        <label htmlFor="video-source-type">Source Type</label>
        <select
          id="video-source-type"
          name="sourceType"
          value={values.sourceType}
          aria-invalid={Boolean(errors.sourceType)}
          aria-describedby={errors.sourceType ? 'video-source-type-error' : undefined}
          onChange={(event) => onChange({ ...values, sourceType: event.target.value as MatchVideoFormValues['sourceType'] })}
        >
          <option value="">Select source type</option>
          {MATCH_VIDEO_SOURCE_TYPES.map((sourceType) => (
            <option key={sourceType} value={sourceType}>
              {sourceType}
            </option>
          ))}
        </select>
        {errors.sourceType ? (
          <p id="video-source-type-error" className="siq-form__error" role="alert">
            {errors.sourceType}
          </p>
        ) : null}
      </div>

      <div className="siq-form__group">
        <label htmlFor="video-source-url">Source URL</label>
        <input
          id="video-source-url"
          name="sourceUrl"
          value={values.sourceUrl}
          aria-invalid={Boolean(errors.sourceUrl)}
          aria-describedby={errors.sourceUrl ? 'video-source-url-error' : undefined}
          onChange={(event) => onChange({ ...values, sourceUrl: event.target.value })}
        />
        {errors.sourceUrl ? (
          <p id="video-source-url-error" className="siq-form__error" role="alert">
            {errors.sourceUrl}
          </p>
        ) : null}
      </div>

      <div className="siq-form__group">
        <label htmlFor="video-duration">Duration (seconds)</label>
        <input
          id="video-duration"
          name="durationSeconds"
          value={values.durationSeconds}
          aria-invalid={Boolean(errors.durationSeconds)}
          aria-describedby={errors.durationSeconds ? 'video-duration-error' : undefined}
          onChange={(event) => onChange({ ...values, durationSeconds: event.target.value })}
        />
        {errors.durationSeconds ? (
          <p id="video-duration-error" className="siq-form__error" role="alert">
            {errors.durationSeconds}
          </p>
        ) : null}
      </div>

      <div className="siq-form__group">
        <label htmlFor="video-notes">Notes</label>
        <textarea id="video-notes" name="notes" value={values.notes} onChange={(event) => onChange({ ...values, notes: event.target.value })} />
      </div>

      <div className="siq-form__actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Video' : 'Attach Video'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {submissionError ? (
        <p className="siq-form__submission-error" role="alert">
          {submissionError}
        </p>
      ) : null}
    </form>
  );
}
