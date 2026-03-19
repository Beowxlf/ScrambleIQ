import { FormEvent, RefObject, useEffect, useRef, useState } from 'react';

import type { Match } from '@scrambleiq/shared';

import { hasValidationErrors, MatchFormValues, MatchValidationErrors, validateMatchForm } from '../match';
import { HttpRequestError, MatchNotFoundError } from '../matches-api';
import type { MatchesApi } from '../matches-api';
import { navigateTo } from '../app/router';
import { EventPanel } from '../features/events/EventPanel';
import { AnalyticsPanel } from '../features/analytics/AnalyticsPanel';
import { DatasetToolsPanel } from '../features/dataset/DatasetToolsPanel';
import { PositionPanel } from '../features/positions/PositionPanel';
import { VideoPanel } from '../features/video/VideoPanel';
import type { VideoSeekRequest } from '../features/video/useMatchVideo';
import { formatTimestamp } from '../timeline-event';

const initialValues: MatchFormValues = {
  title: '',
  date: '',
  ruleset: '',
  competitorA: '',
  competitorB: '',
  notes: '',
};

function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpRequestError) {
    return error.message;
  }

  return fallback;
}

export function MatchDetailPage({ api, matchId }: { api: MatchesApi; matchId: string }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(true);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [isMatchNotFound, setIsMatchNotFound] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editValues, setEditValues] = useState<MatchFormValues>(initialValues);
  const [editErrors, setEditErrors] = useState<MatchValidationErrors>({});
  const [editSubmissionError, setEditSubmissionError] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [workspaceRefreshTrigger, setWorkspaceRefreshTrigger] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [videoSeekRequest, setVideoSeekRequest] = useState<VideoSeekRequest | null>(null);
  const [activeSeekSummary, setActiveSeekSummary] = useState<string | null>(null);
  const reviewContextRef = useRef<HTMLElement | null>(null);
  const timelineReviewRef = useRef<HTMLElement | null>(null);
  const dataQualityToolsRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    let isMounted = true;

    const loadMatch = async () => {
      setIsLoadingMatch(true);
      setMatch(null);
      setMatchError(null);
      setIsMatchNotFound(false);
      setIsEditMode(false);
      setEditSubmissionError(null);
      setEditErrors({});
      setIsDeleteConfirming(false);
      setIsDeleting(false);
      setDeleteError(null);
      setSelectedEventId(null);
      setSelectedPositionId(null);
      setVideoSeekRequest(null);
      setActiveSeekSummary(null);

      try {
        const fetchedMatch = await api.getMatch(matchId);

        if (isMounted) {
          setMatch(fetchedMatch);
          setEditValues({
            title: fetchedMatch.title,
            date: fetchedMatch.date,
            ruleset: fetchedMatch.ruleset,
            competitorA: fetchedMatch.competitorA,
            competitorB: fetchedMatch.competitorB,
            notes: fetchedMatch.notes,
          });
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof MatchNotFoundError) {
          setIsMatchNotFound(true);
          return;
        }

        setMatchError('Unable to load match details right now.');
      } finally {
        if (isMounted) {
          setIsLoadingMatch(false);
        }
      }
    };

    void loadMatch();

    return () => {
      isMounted = false;
    };
  }, [api, matchId]);

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateMatchForm(editValues);
    setEditErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      return;
    }

    setIsSubmittingEdit(true);
    setEditSubmissionError(null);

    try {
      const updatedMatch = await api.updateMatch(matchId, editValues);
      setMatch(updatedMatch);
      setEditValues({
        title: updatedMatch.title,
        date: updatedMatch.date,
        ruleset: updatedMatch.ruleset,
        competitorA: updatedMatch.competitorA,
        competitorB: updatedMatch.competitorB,
        notes: updatedMatch.notes,
      });
      setEditErrors({});
      setIsEditMode(false);
    } catch (error) {
      if (error instanceof MatchNotFoundError) {
        setMatch(null);
        setIsMatchNotFound(true);
        setIsEditMode(false);
        return;
      }

      setEditSubmissionError(getRequestErrorMessage(error, 'Unable to update match. Please try again.'));
    } finally {
      setIsSubmittingEdit(false);
    }
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

  const deleteMatch = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await api.deleteMatch(matchId);
      navigateTo('/');
    } catch (error) {
      if (error instanceof MatchNotFoundError) {
        navigateTo('/');
        return;
      }

      setDeleteError(getRequestErrorMessage(error, 'Unable to delete match. Please try again.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="app-page">
      <header className="app-header">
        <h1>Match Workspace</h1>
        <button type="button" onClick={() => navigateTo('/')}>
          Back to matches
        </button>
      </header>

      <section aria-labelledby="match-detail-heading" className="surface-card">
        <h2 id="match-detail-heading">Match Detail</h2>

        {isLoadingMatch ? <p>Loading match details...</p> : null}
        {!isLoadingMatch && isMatchNotFound ? <p>Match not found.</p> : null}
        {!isLoadingMatch && matchError ? <p>{matchError}</p> : null}

        {!isLoadingMatch && match ? (
          isEditMode ? (
            <form onSubmit={(event) => void submitEdit(event)} noValidate>
              <h3>Edit Match</h3>

              <label htmlFor="edit-title">Title</label>
              <input
                id="edit-title"
                name="title"
                value={editValues.title}
                onChange={(event) => setEditValues({ ...editValues, title: event.target.value })}
              />
              {editErrors.title ? <p className="form-error">{editErrors.title}</p> : null}

              <label htmlFor="edit-date">Date</label>
              <input
                id="edit-date"
                name="date"
                type="date"
                value={editValues.date}
                onChange={(event) => setEditValues({ ...editValues, date: event.target.value })}
              />
              {editErrors.date ? <p className="form-error">{editErrors.date}</p> : null}

              <label htmlFor="edit-ruleset">Ruleset</label>
              <input
                id="edit-ruleset"
                name="ruleset"
                value={editValues.ruleset}
                onChange={(event) => setEditValues({ ...editValues, ruleset: event.target.value })}
              />
              {editErrors.ruleset ? <p className="form-error">{editErrors.ruleset}</p> : null}

              <label htmlFor="edit-competitorA">Competitor A</label>
              <input
                id="edit-competitorA"
                name="competitorA"
                value={editValues.competitorA}
                onChange={(event) => setEditValues({ ...editValues, competitorA: event.target.value })}
              />
              {editErrors.competitorA ? <p className="form-error">{editErrors.competitorA}</p> : null}

              <label htmlFor="edit-competitorB">Competitor B</label>
              <input
                id="edit-competitorB"
                name="competitorB"
                value={editValues.competitorB}
                onChange={(event) => setEditValues({ ...editValues, competitorB: event.target.value })}
              />
              {editErrors.competitorB ? <p className="form-error">{editErrors.competitorB}</p> : null}

              <label htmlFor="edit-notes">Notes</label>
              <textarea
                id="edit-notes"
                name="notes"
                value={editValues.notes}
                onChange={(event) => setEditValues({ ...editValues, notes: event.target.value })}
              />

              <div className="button-row">
                <button type="submit" disabled={isSubmittingEdit}>
                  {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(false);
                    setEditSubmissionError(null);
                    setEditErrors({});
                    setEditValues({
                      title: match.title,
                      date: match.date,
                      ruleset: match.ruleset,
                      competitorA: match.competitorA,
                      competitorB: match.competitorB,
                      notes: match.notes,
                    });
                  }}
                >
                  Cancel
                </button>
              </div>

              {editSubmissionError ? <p className="status-error">{editSubmissionError}</p> : null}
            </form>
          ) : (
            <article style={{ display: 'grid', gap: '0.5rem' }}>
              <h3>{match.title}</h3>
              <p>ID: {match.id}</p>
              <p>Date: {match.date}</p>
              <p>Ruleset: {match.ruleset}</p>
              <p>Competitor A: {match.competitorA}</p>
              <p>Competitor B: {match.competitorB}</p>
              <p>Notes: {match.notes || 'No notes provided.'}</p>
              <div className="button-row">
                <button type="button" onClick={() => setIsEditMode(true)}>
                  Edit Match
                </button>
              </div>
              <div>
                {!isDeleteConfirming ? (
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => {
                      setIsDeleteConfirming(true);
                      setDeleteError(null);
                    }}
                    disabled={isDeleting}
                  >
                    Delete Match
                  </button>
                ) : (
                  <>
                    <p>Are you sure you want to delete this match?</p>
                    <div className="button-row">
                      <button type="button" className="button-danger" onClick={() => void deleteMatch()} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDeleteConfirming(false);
                          setDeleteError(null);
                        }}
                        disabled={isDeleting}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
              {deleteError ? <p className="status-error">{deleteError}</p> : null}
            </article>
          )
        ) : null}
      </section>

      {!isLoadingMatch && !isMatchNotFound && !matchError ? (
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
