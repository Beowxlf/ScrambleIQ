import { CSSProperties, FormEvent } from 'react';

import { MatchFormValues, MatchValidationErrors } from '../match';

interface MatchCreateFormProps {
  formValues: MatchFormValues;
  errors: MatchValidationErrors;
  isSubmitting: boolean;
  onChange: (nextValues: MatchFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

const formStyles: Record<string, CSSProperties> = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #d8e0ec',
    borderRadius: '10px',
    padding: '1rem',
  },
  heading: {
    margin: 0,
    fontSize: '1.05rem',
  },
  subheading: {
    margin: '0.35rem 0 0.95rem',
    color: '#465976',
    fontSize: '0.9rem',
  },
  fieldGroup: {
    display: 'grid',
    gap: '0.35rem',
    marginBottom: '0.8rem',
  },
  label: {
    fontWeight: 600,
    fontSize: '0.92rem',
  },
  input: {
    border: '1px solid #b9c5d8',
    borderRadius: '6px',
    fontSize: '0.95rem',
    padding: '0.45rem 0.55rem',
  },
  error: {
    color: '#842029',
    fontSize: '0.84rem',
    margin: 0,
  },
  button: {
    backgroundColor: '#123f78',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    marginTop: '0.35rem',
    padding: '0.55rem 0.75rem',
    width: '100%',
  },
};

export function MatchCreateForm({ formValues, errors, isSubmitting, onChange, onSubmit }: MatchCreateFormProps) {
  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate style={formStyles.card} aria-labelledby="create-match-heading">
      <h3 id="create-match-heading" style={formStyles.heading}>
        Create Match
      </h3>
      <p style={formStyles.subheading}>Capture the key details and jump into review immediately.</p>

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

      <div style={formStyles.fieldGroup}>
        <label htmlFor="notes" style={formStyles.label}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          style={{ ...formStyles.input, minHeight: '76px', resize: 'vertical' }}
          value={formValues.notes}
          onChange={(event) => onChange({ ...formValues, notes: event.target.value })}
        />
      </div>

      <div className="button-row">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Match'}
        </button>
      </div>
    </form>
  );
}
