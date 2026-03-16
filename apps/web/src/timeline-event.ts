import type { CreateTimelineEventDto } from '@scrambleiq/shared';

export type TimelineEventFormValues = {
  timestamp: string;
  eventType: string;
  competitor: '' | 'A' | 'B';
  notes: string;
};

export interface TimelineEventValidationErrors {
  timestamp?: string;
  eventType?: string;
  competitor?: string;
}

export const initialTimelineEventValues: TimelineEventFormValues = {
  timestamp: '',
  eventType: '',
  competitor: '',
  notes: '',
};

export function validateTimelineEventForm(values: TimelineEventFormValues): TimelineEventValidationErrors {
  const errors: TimelineEventValidationErrors = {};

  if (!values.timestamp.trim()) {
    errors.timestamp = 'Timestamp is required.';
  } else {
    const parsed = Number(values.timestamp);

    if (Number.isInteger(parsed) === false || parsed < 0) {
      errors.timestamp = 'Timestamp must be a non-negative integer.';
    }
  }

  if (!values.eventType.trim()) {
    errors.eventType = 'Event type is required.';
  }

  if (values.competitor !== 'A' && values.competitor !== 'B') {
    errors.competitor = 'Competitor is required.';
  }

  return errors;
}

export function hasTimelineEventValidationErrors(errors: TimelineEventValidationErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function toCreateTimelineEventDto(values: TimelineEventFormValues): CreateTimelineEventDto {
  return {
    timestamp: Number(values.timestamp),
    eventType: values.eventType,
    competitor: values.competitor as 'A' | 'B',
    notes: values.notes || undefined,
  };
}

export function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
}
