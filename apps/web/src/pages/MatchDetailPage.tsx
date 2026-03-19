import { RefObject, useRef, useState } from 'react';

import { navigateTo } from '../app/router';
import { AnalyticsPanel } from '../features/analytics/AnalyticsPanel';
import { DatasetToolsPanel } from '../features/dataset/DatasetToolsPanel';
import { EventPanel } from '../features/events/EventPanel';
import { MatchMetadataSection } from '../features/match-metadata/MatchMetadataSection';
import { useMatchMetadata } from '../features/match-metadata/useMatchMetadata';
import { PositionPanel } from '../features/positions/PositionPanel';
import { VideoPanel } from '../features/video/VideoPanel';
import type { VideoSeekRequest } from '../features/video/useMatchVideo';
import type { MatchesApi } from '../matches-api';
import { formatTimestamp } from '../timeline-event';

export function MatchDetailPage({ api, matchId }: { api: MatchesApi; matchId: string }) {
  const [workspaceRefreshTrigger, setWorkspaceRefreshTrigger] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [videoSeekRequest, setVideoSeekRequest] = useState<VideoSeekRequest | null>(null);
  const [activeSeekSummary, setActiveSeekSummary] = useState<string | null>(null);
  const reviewContextRef = useRef<HTMLElement | null>(null);
  const timelineReviewRef = useRef<HTMLElement | null>(null);
  const dataQualityToolsRef = useRef<HTMLElement | null>(null);

  const matchMetadata = useMatchMetadata({
    api,
    matchId,
    onMatchDeleted: () => navigateTo('/'),
  });

  const seekToTimestamp = (
    timestamp: number,
    selection: { eventId?: string; positionId?: string },
    selectionLabel: string,
    selectionType: 'event' | 'position',
  ) => {
    setVideoSeekRequest({ timestamp, requestId: Date.now() });
    setActiveSeekSummary(`Seeking video to ${formatTimestamp(timestamp)} from ${selectionType}: ${selectionLabel}.`);

    setSelectedEventId(selection.eventId ?? null);
    setSelectedPositionId(selection.positionId ?? null);
  };

  const jumpToReviewSection = (sectionRef: RefObject<HTMLElement | null>) => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const refreshWorkspaceData = () => {
    setWorkspaceRefreshTrigger((currentValue) => currentValue + 1);
  };

  const handleVideoMetadataMutated = () => {
    refreshWorkspaceData();
    setVideoSeekRequest(null);
    setSelectedEventId(null);
    setSelectedPositionId(null);
  };

  return (
    <main className="app-page">
      <header className="app-header">
        <h1>Match Workspace</h1>
        <button type="button" onClick={() => navigateTo('/')}>
          Back to matches
        </button>
      </header>

      <MatchMetadataSection
        match={matchMetadata.match}
        isLoadingMatch={matchMetadata.isLoadingMatch}
        matchError={matchMetadata.matchError}
        isMatchNotFound={matchMetadata.isMatchNotFound}
        isEditMode={matchMetadata.isEditMode}
        editValues={matchMetadata.editValues}
        editErrors={matchMetadata.editErrors}
        editSubmissionError={matchMetadata.editSubmissionError}
        isSubmittingEdit={matchMetadata.isSubmittingEdit}
        isDeleteConfirming={matchMetadata.isDeleteConfirming}
        isDeleting={matchMetadata.isDeleting}
        deleteError={matchMetadata.deleteError}
        onSubmitEdit={matchMetadata.submitEdit}
        onEditValueChange={matchMetadata.setEditValue}
        onStartEdit={matchMetadata.startEdit}
        onCancelEdit={matchMetadata.cancelEdit}
        onStartDeleteConfirmation={matchMetadata.startDeleteConfirmation}
        onCancelDeleteConfirmation={matchMetadata.cancelDeleteConfirmation}
        onDeleteMatch={matchMetadata.deleteMatch}
      />

      {!matchMetadata.isLoadingMatch && !matchMetadata.isMatchNotFound && !matchMetadata.matchError ? (
        <section aria-labelledby="review-workspace-heading">
          <h2 id="review-workspace-heading">Review Workspace</h2>
          <nav aria-label="Review workspace quick navigation" className="review-workspace-nav">
            <button type="button" onClick={() => jumpToReviewSection(reviewContextRef)}>
              Jump to Review Context
            </button>
            <button type="button" onClick={() => jumpToReviewSection(timelineReviewRef)}>
              Jump to Timeline Review
            </button>
            <button type="button" onClick={() => jumpToReviewSection(dataQualityToolsRef)}>
              Jump to Data Quality Tools
            </button>
          </nav>
          {activeSeekSummary ? (
            <p className="review-selection-status" role="status" aria-live="polite">
              {activeSeekSummary}
            </p>
          ) : null}

          <div className="section-stack">
            <section aria-labelledby="review-context-heading" ref={reviewContextRef}>
              <h3 id="review-context-heading">Review Context</h3>
              <AnalyticsPanel api={api} matchId={matchId} refreshTrigger={workspaceRefreshTrigger} />
              <VideoPanel api={api} matchId={matchId} seekRequest={videoSeekRequest} onVideoMetadataMutated={handleVideoMetadataMutated} />
            </section>

            <section aria-labelledby="timeline-review-heading" ref={timelineReviewRef}>
              <h3 id="timeline-review-heading">Timeline Review</h3>
              <EventPanel
                api={api}
                matchId={matchId}
                selectedEventId={selectedEventId}
                onSeekToTimestamp={(timestamp, eventId, eventLabel) =>
                  seekToTimestamp(timestamp, { eventId }, eventLabel, 'event')
                }
                onEventsMutated={refreshWorkspaceData}
              />
              <PositionPanel
                api={api}
                matchId={matchId}
                selectedPositionId={selectedPositionId}
                onSeekToTimestamp={(timestamp, positionId, positionLabel) =>
                  seekToTimestamp(timestamp, { positionId }, positionLabel, 'position')
                }
                onPositionsMutated={refreshWorkspaceData}
              />
            </section>

            <section aria-labelledby="data-quality-tools-heading" ref={dataQualityToolsRef}>
              <h3 id="data-quality-tools-heading">Data Quality Tools</h3>
              <DatasetToolsPanel api={api} matchId={matchId} refreshTrigger={workspaceRefreshTrigger} />
            </section>
          </div>
        </section>
      ) : null}
    </main>
  );
}
