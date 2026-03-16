import type { PositionState } from '@scrambleiq/shared';

import type { MatchesApi } from '../../matches-api';
import { PositionForm } from './PositionForm';
import { PositionList } from './PositionList';
import { useMatchPositions } from './useMatchPositions';

interface PositionPanelProps {
  api: MatchesApi;
  matchId: string;
  selectedPositionId: string | null;
  onSeekToTimestamp: (timestamp: number, positionId: string) => void;
  onPositionsMutated: () => void;
}

export function PositionPanel({ api, matchId, selectedPositionId, onSeekToTimestamp, onPositionsMutated }: PositionPanelProps) {
  const {
    positions,
    positionsError,
    isLoadingPositions,
    isPositionFormVisible,
    positionFormValues,
    positionFormErrors,
    isSubmittingPosition,
    positionSubmissionError,
    editingPositionId,
    setPositionFormValues,
    startCreatePosition,
    startEditPosition,
    submitPosition,
    deletePosition,
    cancelPositionForm,
  } = useMatchPositions({ api, matchId, onPositionsMutated });

  const handleSeekToPosition = (positionState: PositionState) => {
    onSeekToTimestamp(positionState.timestampStart, positionState.id);
  };

  return (
    <section aria-labelledby="position-timeline-heading">
      <h2 id="position-timeline-heading">Position Timeline</h2>

      {!isPositionFormVisible ? (
        <button type="button" onClick={startCreatePosition}>
          Add Position
        </button>
      ) : null}

      {isPositionFormVisible ? (
        <PositionForm
          values={positionFormValues}
          errors={positionFormErrors}
          isSubmitting={isSubmittingPosition}
          isEditing={editingPositionId !== null}
          submissionError={positionSubmissionError}
          onChange={setPositionFormValues}
          onSubmit={submitPosition}
          onCancel={cancelPositionForm}
        />
      ) : null}

      {isLoadingPositions ? <p>Loading position states...</p> : null}
      {positionsError ? <p>{positionsError}</p> : null}

      {!isLoadingPositions && !positionsError && positions.length === 0 ? <p>No position states yet.</p> : null}

      {!isLoadingPositions && !positionsError && positions.length > 0 ? (
        <PositionList
          positions={positions}
          selectedPositionId={selectedPositionId}
          onSeekToPosition={handleSeekToPosition}
          onEdit={startEditPosition}
          onDelete={(positionId) => void deletePosition(positionId)}
        />
      ) : null}
    </section>
  );
}
