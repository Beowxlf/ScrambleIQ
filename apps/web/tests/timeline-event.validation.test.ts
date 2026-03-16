import { describe, expect, it } from 'vitest';

import { hasTimelineEventValidationErrors, validateTimelineEventForm } from '../src/timeline-event';

describe('validateTimelineEventForm', () => {
  it('returns required field errors when missing', () => {
    const errors = validateTimelineEventForm({
      timestamp: '',
      eventType: '',
      competitor: '',
      notes: '',
    });

    expect(errors).toEqual({
      timestamp: 'Timestamp is required.',
      eventType: 'Event type is required.',
      competitor: 'Competitor is required.',
    });
    expect(hasTimelineEventValidationErrors(errors)).toBe(true);
  });

  it('returns timestamp format error when invalid', () => {
    const errors = validateTimelineEventForm({
      timestamp: '-3',
      eventType: 'guard_pass',
      competitor: 'A',
      notes: '',
    });

    expect(errors.timestamp).toBe('Timestamp must be a non-negative integer.');
  });

  it('returns no errors for valid values', () => {
    const errors = validateTimelineEventForm({
      timestamp: '12',
      eventType: 'takedown_attempt',
      competitor: 'B',
      notes: 'Set up from collar tie',
    });

    expect(errors).toEqual({});
    expect(hasTimelineEventValidationErrors(errors)).toBe(false);
  });
});
