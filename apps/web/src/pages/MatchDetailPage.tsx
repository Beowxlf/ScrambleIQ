import { FormEvent, useEffect, useState } from 'react';

import type { Match } from '@scrambleiq/shared';

import { hasValidationErrors, MatchFormValues, MatchValidationErrors, validateMatchForm } from '../match';
import { MatchNotFoundError } from '../matches-api';
import type { MatchesApi } from '../matches-api';
import { navigateTo } from '../app/router';
import { EventPanel } from '../features/events/EventPanel';
import { AnalyticsPanel } from '../features/analytics/AnalyticsPanel';
import { DatasetToolsPanel } from '../features/dataset/DatasetToolsPanel';
import { PositionPanel } from '../features/positions/PositionPanel';
import { VideoPanel } from '../features/video/VideoPanel';
import type { VideoSeekRequest } from '../features/video/useMatchVideo';

const initialValues: MatchFormValues = {
  title: '',
  date: '',
  ruleset: '',
  competitorA: '',
  competitorB: '',
  notes: '',
};

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
  const [analyticsRefreshTrigger, setAnalyticsRefreshTrigger] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [videoSeekRequest, setVideoSeekRequest] = useState<VideoSeekRequest | null>(null);

  const seekToTimestamp = (timestamp: number, selection: { eventId?: string; positionId?: string }) => {
    setVideoSeekRequest({ timestamp, requestId: Date.now() });

    setSelectedEventId(selection.eventId ?? null);
    setSelectedPositionId(selection.positionId ?? null);
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
    } catch {
      setEditSubmissionError('Unable to update match. Please try again.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const refreshAnalytics = async () => {
    setAnalyticsRefreshTrigger((currentValue) => currentValue + 1);
  };

  const deleteMatch = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await api.deleteMatch(matchId);
      navigateTo('/');
    } catch {
      setDeleteError('Unable to delete match. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main>
      <h1>ScrambleIQ</h1>
      <p>
        <button type="button" onClick={() => navigateTo('/')}>
          Back to matches
        </button>
      </p>

      <section aria-labelledby="match-detail-heading">
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
              {editErrors.title ? <p>{editErrors.title}</p> : null}

              <label htmlFor="edit-date">Date</label>
              <input
                id="edit-date"
                name="date"
                type="date"
                value={editValues.date}
                onChange={(event) => setEditValues({ ...editValues, date: event.target.value })}
              />
              {editErrors.date ? <p>{editErrors.date}</p> : null}

              <label htmlFor="edit-ruleset">Ruleset</label>
              <input
                id="edit-ruleset"
                name="ruleset"
                value={editValues.ruleset}
                onChange={(event) => setEditValues({ ...editValues, ruleset: event.target.value })}
              />
              {editErrors.ruleset ? <p>{editErrors.ruleset}</p> : null}

              <label htmlFor="edit-competitorA">Competitor A</label>
              <input
                id="edit-competitorA"
                name="competitorA"
                value={editValues.competitorA}
                onChange={(event) => setEditValues({ ...editValues, competitorA: event.target.value })}
              />
              {editErrors.competitorA ? <p>{editErrors.competitorA}</p> : null}

              <label htmlFor="edit-competitorB">Competitor B</label>
              <input
                id="edit-competitorB"
                name="competitorB"
                value={editValues.competitorB}
                onChange={(event) => setEditValues({ ...editValues, competitorB: event.target.value })}
              />
              {editErrors.competitorB ? <p>{editErrors.competitorB}</p> : null}

              <label htmlFor="edit-notes">Notes</label>
              <textarea
                id="edit-notes"
                name="notes"
                value={editValues.notes}
                onChange={(event) => setEditValues({ ...editValues, notes: event.target.value })}
              />

              <p>
                <button type="submit" disabled={isSubmittingEdit}>
                  {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                </button>{' '}
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
              </p>

              {editSubmissionError ? <p>{editSubmissionError}</p> : null}
            </form>
          ) : (
            <article>
              <h3>{match.title}</h3>
              <p>ID: {match.id}</p>
              <p>Date: {match.date}</p>
              <p>Ruleset: {match.ruleset}</p>
              <p>Competitor A: {match.competitorA}</p>
              <p>Competitor B: {match.competitorB}</p>
              <p>Notes: {match.notes || 'No notes provided.'}</p>
              <p>
                <button type="button" onClick={() => setIsEditMode(true)}>
                  Edit Match
                </button>
              </p>
              <div>
                {!isDeleteConfirming ? (
                  <button
                    type="button"
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
                    <button type="button" onClick={() => void deleteMatch()} disabled={isDeleting}>
                      {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>{' '}
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
                  </>
                )}
              </div>
              {deleteError ? <p>{deleteError}</p> : null}
            </article>
          )
        ) : null}
      </section>

      {!isLoadingMatch && !isMatchNotFound && !matchError ? (
        <DatasetToolsPanel api={api} matchId={matchId} />
      ) : null}

      {!isLoadingMatch && !isMatchNotFound && !matchError ? <AnalyticsPanel api={api} matchId={matchId} refreshTrigger={analyticsRefreshTrigger} /> : null}

      {!isLoadingMatch && !isMatchNotFound && !matchError ? <VideoPanel api={api} matchId={matchId} seekRequest={videoSeekRequest} /> : null}

      {!isLoadingMatch && !isMatchNotFound && !matchError ? (
        <EventPanel
          api={api}
          matchId={matchId}
          selectedEventId={selectedEventId}
          onSeekToTimestamp={(timestamp, eventId) => seekToTimestamp(timestamp, { eventId })}
          onEventsMutated={refreshAnalytics}
        />
      ) : null}

      {!isLoadingMatch && !isMatchNotFound && !matchError ? (
        <PositionPanel
          api={api}
          matchId={matchId}
          selectedPositionId={selectedPositionId}
          onSeekToTimestamp={(timestamp, positionId) => seekToTimestamp(timestamp, { positionId })}
          onPositionsMutated={refreshAnalytics}
        />
      ) : null}
    </main>
  );
}
