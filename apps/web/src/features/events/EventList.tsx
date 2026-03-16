import type { TimelineEvent } from '@scrambleiq/shared';

import { formatTimestamp } from '../../timeline-event';

interface EventListProps {
  events: TimelineEvent[];
  selectedEventId: string | null;
  onSeekToEvent: (timelineEvent: TimelineEvent) => void;
  onEdit: (timelineEvent: TimelineEvent) => void;
  onDelete: (eventId: string) => void;
}

export function EventList({ events, selectedEventId, onSeekToEvent, onEdit, onDelete }: EventListProps) {
  return (
    <ul>
      {events.map((timelineEvent) => (
        <li key={timelineEvent.id}>
          <button
            type="button"
            onClick={() => onSeekToEvent(timelineEvent)}
            aria-pressed={selectedEventId === timelineEvent.id}
          >
            {formatTimestamp(timelineEvent.timestamp)} {timelineEvent.eventType} {timelineEvent.competitor}
          </button>{' '}
          <button type="button" onClick={() => onEdit(timelineEvent)}>
            Edit Event
          </button>{' '}
          <button type="button" onClick={() => onDelete(timelineEvent.id)}>
            Delete Event
          </button>
          {timelineEvent.notes ? <p>Notes: {timelineEvent.notes}</p> : null}
        </li>
      ))}
    </ul>
  );
}
