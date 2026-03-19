import { FormEvent } from 'react';

import { MatchFormValues, MatchValidationErrors } from '../match';

interface MatchCreateFormProps {
  formValues: MatchFormValues;
  errors: MatchValidationErrors;
  isSubmitting: boolean;
  onChange: (nextValues: MatchFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function MatchCreateForm({ formValues, errors, isSubmitting, onChange, onSubmit }: MatchCreateFormProps) {
  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate className="siq-form" aria-busy={isSubmitting}>
      <div className="siq-form__header">
        <h2>Create Match</h2>
        <p className="siq-form__mode">Create a new match record before adding video, events, and positions.</p>
      </div>

      <div className="siq-form__group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={formValues.title}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'match-title-error' : undefined}
          onChange={(event) => onChange({ ...formValues, title: event.target.value })}
        />
        {errors.title ? (
          <p id="match-title-error" className="siq-form__error" role="alert">
            {errors.title}
          </p>
        ) : null}
      </div>

      <div className="siq-form__group">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          name="date"
          type="date"
          value={formValues.date}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? 'match-date-error' : undefined}
          onChange={(event) => onChange({ ...formValues, date: event.target.value })}
        />
        {errors.date ? (
          <p id="match-date-error" className="siq-form__error" role="alert">
            {errors.date}
          </p>
        ) : null}
      </div>

      <div className="siq-form__group">
        <label htmlFor="ruleset">Ruleset</label>
        <input
          id="ruleset"
          name="ruleset"
          value={formValues.ruleset}
          aria-invalid={Boolean(errors.ruleset)}
          aria-describedby={errors.ruleset ? 'match-ruleset-error' : undefined}
          onChange={(event) => onChange({ ...formValues, ruleset: event.target.value })}
        />
        {errors.ruleset ? (
          <p id="match-ruleset-error" className="siq-form__error" role="alert">
            {errors.ruleset}
          </p>
        ) : null}
      </div>

      <div className="siq-form__group">
        <label htmlFor="competitorA">Competitor A</label>
        <input
          id="competitorA"
          name="competitorA"
          value={formValues.competitorA}
          aria-invalid={Boolean(errors.competitorA)}
          aria-describedby={errors.competitorA ? 'match-competitor-a-error' : undefined}
          onChange={(event) => onChange({ ...formValues, competitorA: event.target.value })}
        />
        {errors.competitorA ? (
          <p id="match-competitor-a-error" className="siq-form__error" role="alert">
            {errors.competitorA}
          </p>
        ) : null}
      </div>

      <div className="siq-form__group">
        <label htmlFor="competitorB">Competitor B</label>
        <input
          id="competitorB"
          name="competitorB"
          value={formValues.competitorB}
          aria-invalid={Boolean(errors.competitorB)}
          aria-describedby={errors.competitorB ? 'match-competitor-b-error' : undefined}
          onChange={(event) => onChange({ ...formValues, competitorB: event.target.value })}
        />
        {errors.competitorB ? (
          <p id="match-competitor-b-error" className="siq-form__error" role="alert">
            {errors.competitorB}
          </p>
        ) : null}
      </div>

      <div className="siq-form__group">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" value={formValues.notes} onChange={(event) => onChange({ ...formValues, notes: event.target.value })} />
      </div>

      <div className="siq-form__actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Match'}
        </button>
      </div>
    </form>
  );
}
