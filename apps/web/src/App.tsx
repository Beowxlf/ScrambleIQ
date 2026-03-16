import { FormEvent, useState } from 'react';

import { hasValidationErrors, MatchFormValues, MatchValidationErrors, validateMatchForm } from './match';

const initialValues: MatchFormValues = {
  title: '',
  date: '',
  ruleset: '',
  competitorA: '',
  competitorB: '',
  notes: '',
};

export function App() {
  const [formValues, setFormValues] = useState<MatchFormValues>(initialValues);
  const [errors, setErrors] = useState<MatchValidationErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateMatchForm(formValues);
    setErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      setIsSubmitted(false);
      return;
    }

    setIsSubmitted(true);
  };

  return (
    <main>
      <h1>ScrambleIQ</h1>
      <p>Create a match to begin manual-first tracking and review.</p>

      <form onSubmit={onSubmit} noValidate>
        <h2>Create Match</h2>

        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={formValues.title}
          onChange={(event) => setFormValues({ ...formValues, title: event.target.value })}
        />
        {errors.title ? <p>{errors.title}</p> : null}

        <label htmlFor="date">Date</label>
        <input
          id="date"
          name="date"
          type="date"
          value={formValues.date}
          onChange={(event) => setFormValues({ ...formValues, date: event.target.value })}
        />
        {errors.date ? <p>{errors.date}</p> : null}

        <label htmlFor="ruleset">Ruleset</label>
        <input
          id="ruleset"
          name="ruleset"
          value={formValues.ruleset}
          onChange={(event) => setFormValues({ ...formValues, ruleset: event.target.value })}
        />
        {errors.ruleset ? <p>{errors.ruleset}</p> : null}

        <label htmlFor="competitorA">Competitor A</label>
        <input
          id="competitorA"
          name="competitorA"
          value={formValues.competitorA}
          onChange={(event) => setFormValues({ ...formValues, competitorA: event.target.value })}
        />
        {errors.competitorA ? <p>{errors.competitorA}</p> : null}

        <label htmlFor="competitorB">Competitor B</label>
        <input
          id="competitorB"
          name="competitorB"
          value={formValues.competitorB}
          onChange={(event) => setFormValues({ ...formValues, competitorB: event.target.value })}
        />
        {errors.competitorB ? <p>{errors.competitorB}</p> : null}

        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formValues.notes}
          onChange={(event) => setFormValues({ ...formValues, notes: event.target.value })}
        />

        <button type="submit">Create Match</button>
      </form>

      {isSubmitted ? <p>Match is valid and ready to submit.</p> : null}
    </main>
  );
}
