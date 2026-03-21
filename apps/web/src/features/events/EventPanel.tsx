import type { TimelineEvent } from '@scrambleiq/shared';
import type { SavedReviewPresetConfig } from '@scrambleiq/shared';

import type { MatchesApi } from '../../matches-api';
import { EventForm } from './EventForm';
import { EventList } from './EventList';
import { useMatchEvents } from './useMatchEvents';

interface EventPanelProps {
  api: MatchesApi;
  matchId: string;
  reviewSettings?: SavedReviewPresetConfig;
  selectedEventId: string | null;
  onSeekToTimestamp: (timestamp: number, eventId: string, eventLabel: string) => void;
  onEventsMutated: () => void;
}

export function EventPanel({
  api,
  matchId,
  reviewSettings = {},
  selectedEventId,
  onSeekToTimestamp,
  onEventsMutated,
}: EventPanelProps) {
  const {
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
  } = useMatchEvents({ api, matchId, onEventsMutated });

  const handleSeekToEvent = (eventToSeek: TimelineEvent) => {
    const eventLabel = `${eventToSeek.eventType} ${eventToSeek.competitor}`;
    onSeekToTimestamp(eventToSeek.timestamp, eventToSeek.id, eventLabel);
  };
  const allowedEventTypes = reviewSettings.eventTypeFilters && reviewSettings.eventTypeFilters.length > 0
    ? new Set(reviewSettings.eventTypeFilters.map((eventType) => eventType.trim().toLowerCase()))
    : null;

  const visibleEvents = events.filter((eventItem) => {
    if (reviewSettings.competitorFilter && eventItem.competitor !== reviewSettings.competitorFilter) {
      return false;
    }

    if (allowedEventTypes) {
      const normalizedEventType = eventItem.eventType.trim().toLowerCase();
      if (!allowedEventTypes.has(normalizedEventType)) {
        return false;
      }
    }

    return true;
  });

  return (
    <section aria-labelledby="event-timeline-heading">
      <h2 id="event-timeline-heading">Event Timeline</h2>

      {!isEventFormVisible ? (
        <button type="button" onClick={startCreateEvent}>
          Add Event
        </button>
      ) : null}

      {isEventFormVisible ? (
        <EventForm
          values={eventFormValues}
          errors={eventFormErrors}
          isSubmitting={isSubmittingEvent}
          isEditing={editingEventId !== null}
          submissionError={eventSubmissionError}
          onChange={setEventFormValues}
          onSubmit={submitEvent}
          onCancel={cancelEventForm}
        />
      ) : null}

      {!isEventFormVisible && eventSubmissionError ? <p className="status-error">{eventSubmissionError}</p> : null}

      {isLoadingEvents ? <p>Loading timeline events...</p> : null}
      {eventsError ? <p>{eventsError}</p> : null}

      {!isLoadingEvents && !eventsError && events.length === 0 ? <p>No timeline events yet.</p> : null}
      {!isLoadingEvents && !eventsError && events.length > 0 && visibleEvents.length === 0
        ? <p>No timeline events match the active review settings.</p>
        : null}

      {!isLoadingEvents && !eventsError && visibleEvents.length > 0 ? (
        <EventList
          events={visibleEvents}
          selectedEventId={selectedEventId}
          onSeekToEvent={handleSeekToEvent}
          onEdit={startEditEvent}
          onDelete={(eventId) => void deleteEvent(eventId)}
        />
      ) : null}
    </section>
  );
}
