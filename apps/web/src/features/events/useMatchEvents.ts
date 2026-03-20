import { FormEvent, useEffect, useState } from 'react';

import type { TimelineEvent } from '@scrambleiq/shared';

import { HttpRequestError, MatchNotFoundError, MatchesApi, TimelineEventNotFoundError } from '../../matches-api';
import {
  hasTimelineEventValidationErrors,
  initialTimelineEventValues,
  TimelineEventFormValues,
  TimelineEventValidationErrors,
  toCreateTimelineEventDto,
  validateTimelineEventForm,
} from '../../timeline-event';

interface UseMatchEventsArgs {
  api: MatchesApi;
  matchId: string;
  onEventsMutated: () => void;
}

function toRepeatedEntryValues(values: TimelineEventFormValues): TimelineEventFormValues {
  return {
    timestamp: '',
    eventType: values.eventType,
    competitor: values.competitor,
    notes: '',
  };
}

function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpRequestError) {
    return error.message;
  }

  return fallback;
}

export function useMatchEvents({ api, matchId, onEventsMutated }: UseMatchEventsArgs) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isEventFormVisible, setIsEventFormVisible] = useState(false);
  const [eventFormValues, setEventFormValues] = useState<TimelineEventFormValues>(initialTimelineEventValues);
  const [eventFormErrors, setEventFormErrors] = useState<TimelineEventValidationErrors>({});
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [eventSubmissionError, setEventSubmissionError] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      setIsLoadingEvents(true);
      setEventsError(null);
      setEvents([]);
      setEditingEventId(null);
      setEventFormValues(initialTimelineEventValues);
      setEventFormErrors({});
      setEventSubmissionError(null);
      setIsEventFormVisible(false);

      try {
        const fetchedEvents = await api.listTimelineEvents(matchId);

        if (isMounted) {
          setEvents(fetchedEvents);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof MatchNotFoundError) {
          return;
        }

        setEventsError('Unable to load timeline events right now.');
      } finally {
        if (isMounted) {
          setIsLoadingEvents(false);
        }
      }
    };

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, [api, matchId]);

  const submitEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submittedValues: TimelineEventFormValues = { ...eventFormValues };
    const submitMode =
      event.nativeEvent instanceof SubmitEvent && event.nativeEvent.submitter instanceof HTMLButtonElement
        ? event.nativeEvent.submitter.value
        : 'close';

    const validationErrors = validateTimelineEventForm(submittedValues);
    setEventFormErrors(validationErrors);

    if (hasTimelineEventValidationErrors(validationErrors)) {
      return;
    }

    setIsSubmittingEvent(true);
    setEventSubmissionError(null);

    try {
      if (editingEventId) {
        const updatedEvent = await api.updateTimelineEvent(editingEventId, toCreateTimelineEventDto(submittedValues));
        setEvents((previousEvents) =>
          previousEvents
            .map((currentEvent) => (currentEvent.id === editingEventId ? updatedEvent : currentEvent))
            .sort((a, b) => a.timestamp - b.timestamp),
        );
      } else {
        const createdEvent = await api.createTimelineEvent(matchId, toCreateTimelineEventDto(submittedValues));
        setEvents((previousEvents) => [...previousEvents, createdEvent].sort((a, b) => a.timestamp - b.timestamp));
      }

      const isAddingAnother = !editingEventId && submitMode === 'addAnother';

      setEventFormValues(isAddingAnother ? toRepeatedEntryValues(submittedValues) : initialTimelineEventValues);
      setEventFormErrors({});
      setEditingEventId(null);
      setIsEventFormVisible(isAddingAnother);
      onEventsMutated();
    } catch (error) {
      if (error instanceof MatchNotFoundError) {
        setEventSubmissionError('This match is no longer available. Return to the match list and refresh.');
        return;
      }

      if (error instanceof TimelineEventNotFoundError && editingEventId) {
        setEvents((previousEvents) => previousEvents.filter((currentEvent) => currentEvent.id !== editingEventId));
        setEditingEventId(null);
        setIsEventFormVisible(false);
        setEventFormValues(initialTimelineEventValues);
        setEventFormErrors({});
        setEventSubmissionError('This timeline event no longer exists. The list has been refreshed.');
        return;
      }

      setEventSubmissionError(getRequestErrorMessage(error, 'Unable to save timeline event. Please try again.'));
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    setEventSubmissionError(null);

    try {
      await api.deleteTimelineEvent(eventId);
      setEvents((previousEvents) => previousEvents.filter((timelineEvent) => timelineEvent.id !== eventId));

      onEventsMutated();

      if (editingEventId === eventId) {
        setEditingEventId(null);
        setEventFormValues(initialTimelineEventValues);
        setEventFormErrors({});
      }
    } catch (error) {
      if (error instanceof TimelineEventNotFoundError) {
        setEvents((previousEvents) => previousEvents.filter((timelineEvent) => timelineEvent.id !== eventId));
        setEventSubmissionError('This timeline event no longer exists. The list has been refreshed.');
        return;
      }

      setEventSubmissionError(getRequestErrorMessage(error, 'Unable to delete timeline event. Please try again.'));
    }
  };

  const startCreateEvent = () => {
    setIsEventFormVisible(true);
    setEditingEventId(null);
    setEventFormValues(initialTimelineEventValues);
    setEventFormErrors({});
    setEventSubmissionError(null);
  };

  const startEditEvent = (eventToEdit: TimelineEvent) => {
    setEditingEventId(eventToEdit.id);
    setEventFormValues({
      timestamp: String(eventToEdit.timestamp),
      eventType: eventToEdit.eventType,
      competitor: eventToEdit.competitor,
      notes: eventToEdit.notes ?? '',
    });
    setEventFormErrors({});
    setEventSubmissionError(null);
    setIsEventFormVisible(true);
  };

  const cancelEventForm = () => {
    setIsEventFormVisible(false);
    setEditingEventId(null);
    setEventFormValues(initialTimelineEventValues);
    setEventFormErrors({});
    setEventSubmissionError(null);
  };

  return {
    events,
    eventsError,
    isLoadingEvents,
    isEventFormVisible,
    eventFormValues,
    eventFormErrors,
    isSubmittingEvent,
    eventSubmissionError,
    editingEventId,
    setEventFormValues,
    startCreateEvent,
    startEditEvent,
    submitEvent,
    deleteEvent,
    cancelEventForm,
  };
}
