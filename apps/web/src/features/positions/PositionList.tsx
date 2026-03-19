import type { PositionState } from '@scrambleiq/shared';

import { formatTimestamp } from '../../timeline-event';

interface PositionListProps {
  positions: PositionState[];
  selectedPositionId: string | null;
  onSeekToPosition: (positionState: PositionState) => void;
  onEdit: (positionState: PositionState) => void;
  onDelete: (positionId: string) => void;
}

export function PositionList({ positions, selectedPositionId, onSeekToPosition, onEdit, onDelete }: PositionListProps) {
  return (
    <ul>
      {positions.map((position) => {
        const positionLabel = `${formatTimestamp(position.timestampStart)} - ${formatTimestamp(position.timestampEnd)} ${position.position} top: ${position.competitorTop}`;

        return (
          <li key={position.id}>
            <button
              type="button"
              onClick={() => onSeekToPosition(position)}
              aria-pressed={selectedPositionId === position.id}
              aria-label={positionLabel}
              className={selectedPositionId === position.id ? 'timeline-seek-button timeline-seek-button--active' : 'timeline-seek-button'}
            >
              {positionLabel}
            </button>{' '}
            <button type="button" onClick={() => onEdit(position)}>
              Edit Position
            </button>{' '}
            <button type="button" onClick={() => onDelete(position.id)}>
              Delete Position
            </button>
            {position.notes ? <p>Notes: {position.notes}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
