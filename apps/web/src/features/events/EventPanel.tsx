import type { TimelineEvent } from '@scrambleiq/shared';

import type { MatchesApi } from '../../matches-api';
import { EventForm } from './EventForm';
import { EventList } from './EventList';
import { useMatchEvents } from './useMatchEvents';

interface EventPanelProps {
  api: MatchesApi;
  matchId: string;
  selectedEventId: string | null;
  onSeekToTimestamp: (timestamp: number, eventId: string) => void;
  onEventsMutated: () => Promise<void>;
}

export function EventPanel({ api, matchId, selectedEventId, onSeekToTimestamp, onEventsMutated }: EventPanelProps) {
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
    onSeekToTimestamp(eventToSeek.timestamp, eventToSeek.id);
  };

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

      {isLoadingEvents ? <p>Loading timeline events...</p> : null}
      {eventsError ? <p>{eventsError}</p> : null}

      {!isLoadingEvents && !eventsError && events.length === 0 ? <p>No timeline events yet.</p> : null}

      {!isLoadingEvents && !eventsError && events.length > 0 ? (
        <EventList
          events={events}
          selectedEventId={selectedEventId}
          onSeekToEvent={handleSeekToEvent}
          onEdit={startEditEvent}
          onDelete={(eventId) => void deleteEvent(eventId)}
        />
      ) : null}
    </section>
  );
}
