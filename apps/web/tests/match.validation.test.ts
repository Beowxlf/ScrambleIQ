import { describe, expect, it } from 'vitest';

import { hasValidationErrors, validateMatchForm } from '../src/match';

describe('validateMatchForm', () => {
  it('returns required field errors when empty', () => {
    const errors = validateMatchForm({
      title: '',
      date: '',
      ruleset: '',
      competitorA: '',
      competitorB: '',
      notes: '',
    });

    expect(errors).toEqual({
      title: 'Title is required.',
      date: 'Date is required.',
      ruleset: 'Ruleset is required.',
      competitorA: 'Competitor A is required.',
      competitorB: 'Competitor B is required.',
    });
    expect(hasValidationErrors(errors)).toBe(true);
  });

  it('returns no errors for valid values', () => {
    const errors = validateMatchForm({
      title: 'Regional Finals',
      date: '2026-03-03',
      ruleset: 'Greco-Roman',
      competitorA: 'Taylor Smith',
      competitorB: 'Riley Fox',
      notes: 'Finals',
    });

    expect(errors).toEqual({});
    expect(hasValidationErrors(errors)).toBe(false);
  });
});
