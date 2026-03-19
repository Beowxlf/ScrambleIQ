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
    <form onSubmit={(event) => void onSubmit(event)} noValidate>
      <h2>Create Match</h2>

      <label htmlFor="title">Title</label>
      <input id="title" name="title" value={formValues.title} onChange={(event) => onChange({ ...formValues, title: event.target.value })} />
      {errors.title ? <p className="form-error">{errors.title}</p> : null}

      <label htmlFor="date">Date</label>
      <input
        id="date"
        name="date"
        type="date"
        value={formValues.date}
        onChange={(event) => onChange({ ...formValues, date: event.target.value })}
      />
      {errors.date ? <p className="form-error">{errors.date}</p> : null}

      <label htmlFor="ruleset">Ruleset</label>
      <input
        id="ruleset"
        name="ruleset"
        value={formValues.ruleset}
        onChange={(event) => onChange({ ...formValues, ruleset: event.target.value })}
      />
      {errors.ruleset ? <p className="form-error">{errors.ruleset}</p> : null}

      <label htmlFor="competitorA">Competitor A</label>
      <input
        id="competitorA"
        name="competitorA"
        value={formValues.competitorA}
        onChange={(event) => onChange({ ...formValues, competitorA: event.target.value })}
      />
      {errors.competitorA ? <p className="form-error">{errors.competitorA}</p> : null}

      <label htmlFor="competitorB">Competitor B</label>
      <input
        id="competitorB"
        name="competitorB"
        value={formValues.competitorB}
        onChange={(event) => onChange({ ...formValues, competitorB: event.target.value })}
      />
      {errors.competitorB ? <p className="form-error">{errors.competitorB}</p> : null}

      <label htmlFor="notes">Notes</label>
      <textarea id="notes" name="notes" value={formValues.notes} onChange={(event) => onChange({ ...formValues, notes: event.target.value })} />

      <div className="button-row">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Match'}
        </button>
      </div>
    </form>
  );
}
