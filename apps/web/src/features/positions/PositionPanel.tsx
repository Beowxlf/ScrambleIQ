import type { PositionState, SavedReviewPresetConfig } from '@scrambleiq/shared';

import type { MatchesApi } from '../../matches-api';
import { PositionForm } from './PositionForm';
import { PositionList } from './PositionList';
import { useMatchPositions } from './useMatchPositions';

interface PositionPanelProps {
  api: MatchesApi;
  matchId: string;
  reviewSettings?: SavedReviewPresetConfig;
  selectedPositionId: string | null;
  onSeekToTimestamp: (timestamp: number, positionId: string, positionLabel: string) => void;
  onPositionsMutated: () => void;
}

export function PositionPanel({
  api,
  matchId,
  reviewSettings = {},
  selectedPositionId,
  onSeekToTimestamp,
  onPositionsMutated,
}: PositionPanelProps) {
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
    const positionLabel = `${positionState.position} top: ${positionState.competitorTop}`;
    onSeekToTimestamp(positionState.timestampStart, positionState.id, positionLabel);
  };

  const allowedPositions = reviewSettings.positionFilters && reviewSettings.positionFilters.length > 0
    ? new Set(reviewSettings.positionFilters)
    : null;

  const visiblePositions = positions.filter((positionItem) => {
    if (reviewSettings.competitorFilter && positionItem.competitorTop !== reviewSettings.competitorFilter) {
      return false;
    }

    if (allowedPositions && !allowedPositions.has(positionItem.position)) {
      return false;
    }

    return true;
  });

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

      {!isPositionFormVisible && positionSubmissionError ? <p className="status-error">{positionSubmissionError}</p> : null}

      {isLoadingPositions ? <p>Loading position states...</p> : null}
      {positionsError ? <p>{positionsError}</p> : null}

      {!isLoadingPositions && !positionsError && positions.length === 0 ? <p>No position states yet.</p> : null}
      {!isLoadingPositions && !positionsError && positions.length > 0 && visiblePositions.length === 0
        ? <p>No position states match the active review settings.</p>
        : null}

      {!isLoadingPositions && !positionsError && visiblePositions.length > 0 ? (
        <PositionList
          positions={visiblePositions}
          selectedPositionId={selectedPositionId}
          onSeekToPosition={handleSeekToPosition}
          onEdit={startEditPosition}
          onDelete={(positionId) => void deletePosition(positionId)}
        />
      ) : null}
    </section>
  );
}
