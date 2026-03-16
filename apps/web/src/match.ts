export interface MatchFormValues {
  title: string;
  date: string;
  ruleset: string;
  competitorA: string;
  competitorB: string;
  notes: string;
}

export interface MatchValidationErrors {
  title?: string;
  date?: string;
  ruleset?: string;
  competitorA?: string;
  competitorB?: string;
}

export function validateMatchForm(values: MatchFormValues): MatchValidationErrors {
  const errors: MatchValidationErrors = {};

  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  }

  if (!values.date.trim()) {
    errors.date = 'Date is required.';
  }

  if (!values.ruleset.trim()) {
    errors.ruleset = 'Ruleset is required.';
  }

  if (!values.competitorA.trim()) {
    errors.competitorA = 'Competitor A is required.';
  }

  if (!values.competitorB.trim()) {
    errors.competitorB = 'Competitor B is required.';
  }

  return errors;
}

export function hasValidationErrors(errors: MatchValidationErrors): boolean {
  return Object.values(errors).some(Boolean);
}
