import { FormEvent, useEffect, useState } from 'react';

import type { DatasetValidationIssue, DatasetValidationReport, Match, MatchAnalyticsSummary, MatchDatasetExport, MatchVideo, PositionState } from '@scrambleiq/shared';

import { hasValidationErrors, MatchFormValues, MatchValidationErrors, validateMatchForm } from '../match';
import { MatchNotFoundError } from '../matches-api';
import type { MatchesApi } from '../matches-api';
import { navigateTo } from '../app/router';
import { formatTimestamp } from '../timeline-event';
import {
  hasPositionStateValidationErrors,
  initialPositionStateValues,
  POSITION_TYPES,
  PositionStateFormValues,
  PositionStateValidationErrors,
  toCreatePositionStateDto,
  validatePositionStateForm,
} from '../position-state';
import {
  hasMatchVideoValidationErrors,
  initialMatchVideoValues,
  MATCH_VIDEO_SOURCE_TYPES,
  MatchVideoFormValues,
  MatchVideoValidationErrors,
  toCreateMatchVideoDto,
  validateMatchVideoForm,
} from '../match-video';
import { EventPanel } from '../features/events/EventPanel';

const initialValues: MatchFormValues = {
  title: '',
  date: '',
  ruleset: '',
  competitorA: '',
  competitorB: '',
  notes: '',
};

function downloadDatasetAsJson(dataset: MatchDatasetExport, matchId: string): void {
  const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `match-${matchId}-dataset.json`;
  link.click();
  URL.revokeObjectURL(href);
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
  const [isExportingDataset, setIsExportingDataset] = useState(false);
  const [datasetExportError, setDatasetExportError] = useState<string | null>(null);
  const [validationReport, setValidationReport] = useState<DatasetValidationReport | null>(null);
  const [isValidatingDataset, setIsValidatingDataset] = useState(false);
  const [datasetValidationError, setDatasetValidationError] = useState<string | null>(null);

  const [positions, setPositions] = useState<PositionState[]>([]);
  const [positionsError, setPositionsError] = useState<string | null>(null);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);
  const [analytics, setAnalytics] = useState<MatchAnalyticsSummary | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isPositionFormVisible, setIsPositionFormVisible] = useState(false);
  const [positionFormValues, setPositionFormValues] = useState<PositionStateFormValues>(initialPositionStateValues);
  const [positionFormErrors, setPositionFormErrors] = useState<PositionStateValidationErrors>({});
  const [isSubmittingPosition, setIsSubmittingPosition] = useState(false);
  const [positionSubmissionError, setPositionSubmissionError] = useState<string | null>(null);
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null);
  const [video, setVideo] = useState<MatchVideo | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoFormVisible, setIsVideoFormVisible] = useState(false);
  const [videoFormValues, setVideoFormValues] = useState<MatchVideoFormValues>(initialMatchVideoValues);
  const [videoFormErrors, setVideoFormErrors] = useState<MatchVideoValidationErrors>({});
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);
  const [videoSubmissionError, setVideoSubmissionError] = useState<string | null>(null);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const seekToTimestamp = (timestamp: number, selection: { eventId?: string; positionId?: string }) => {
    if (videoElement) {
      videoElement.currentTime = timestamp;
      void videoElement.play().catch(() => undefined);
    }

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

    const loadVideo = async () => {
      setIsLoadingVideo(true);
      setVideoError(null);
      setVideo(null);
      setVideoSubmissionError(null);
      setVideoFormErrors({});
      setVideoFormValues(initialMatchVideoValues);
      setIsVideoFormVisible(false);
      setIsEditingVideo(false);

      try {
        const fetchedVideo = await api.getMatchVideo(matchId);

        if (isMounted) {
          setVideo(fetchedVideo);
        }
      } catch {
        if (isMounted) {
          setVideoError(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingVideo(false);
        }
      }
    };

    const loadAnalytics = async () => {
      setIsLoadingAnalytics(true);
      setAnalyticsError(null);
      setAnalytics(null);

      try {
        const fetchedAnalytics = await api.getMatchAnalytics(matchId);

        if (isMounted) {
          setAnalytics(fetchedAnalytics);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof MatchNotFoundError) {
          return;
        }

        setAnalyticsError('Unable to load analytics summary right now.');
      } finally {
        if (isMounted) {
          setIsLoadingAnalytics(false);
        }
      }
    };

    const loadPositions = async () => {
      setIsLoadingPositions(true);
      setPositionsError(null);
      setPositions([]);
      setEditingPositionId(null);
      setPositionFormValues(initialPositionStateValues);
      setPositionFormErrors({});
      setPositionSubmissionError(null);
      setIsPositionFormVisible(false);

      try {
        const fetchedPositions = await api.listPositionStates(matchId);

        if (isMounted) {
          setPositions(fetchedPositions);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof MatchNotFoundError) {
          return;
        }

        setPositionsError('Unable to load position states right now.');
      } finally {
        if (isMounted) {
          setIsLoadingPositions(false);
        }
      }
    };

    void loadPositions();
    void loadVideo();
    void loadAnalytics();

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
    try {
      const fetchedAnalytics = await api.getMatchAnalytics(matchId);
      setAnalytics(fetchedAnalytics);
      setAnalyticsError(null);
    } catch {
      setAnalyticsError('Unable to load analytics summary right now.');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const submitPosition = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validatePositionStateForm(positionFormValues);
    setPositionFormErrors(validationErrors);

    if (hasPositionStateValidationErrors(validationErrors)) {
      return;
    }

    setIsSubmittingPosition(true);
    setPositionSubmissionError(null);

    try {
      if (editingPositionId) {
        const updatedPosition = await api.updatePositionState(editingPositionId, toCreatePositionStateDto(positionFormValues));
        setPositions((previous) =>
          previous
            .map((position) => (position.id === editingPositionId ? updatedPosition : position))
            .sort((a, b) => a.timestampStart - b.timestampStart),
        );
      } else {
        const createdPosition = await api.createPositionState(matchId, toCreatePositionStateDto(positionFormValues));
        setPositions((previous) => [...previous, createdPosition].sort((a, b) => a.timestampStart - b.timestampStart));
      }

      setPositionFormValues(initialPositionStateValues);
      setPositionFormErrors({});
      setEditingPositionId(null);
      setIsPositionFormVisible(false);
      await refreshAnalytics();
    } catch {
      setPositionSubmissionError('Unable to save position state. Please try again.');
    } finally {
      setIsSubmittingPosition(false);
    }
  };

  const deletePosition = async (positionId: string) => {
    setPositionSubmissionError(null);

    try {
      await api.deletePositionState(positionId);
      setPositions((previous) => previous.filter((position) => position.id !== positionId));

      await refreshAnalytics();

      if (editingPositionId === positionId) {
        setEditingPositionId(null);
        setPositionFormValues(initialPositionStateValues);
        setPositionFormErrors({});
      }
    } catch {
      setPositionSubmissionError('Unable to delete position state. Please try again.');
    }
  };

  const startEditPosition = (positionToEdit: PositionState) => {
    setEditingPositionId(positionToEdit.id);
    setPositionFormValues({
      position: positionToEdit.position,
      competitorTop: positionToEdit.competitorTop,
      timestampStart: String(positionToEdit.timestampStart),
      timestampEnd: String(positionToEdit.timestampEnd),
      notes: positionToEdit.notes ?? '',
    });
    setPositionFormErrors({});
    setPositionSubmissionError(null);
    setIsPositionFormVisible(true);
  };

  const submitVideo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateMatchVideoForm(videoFormValues);
    setVideoFormErrors(validationErrors);

    if (hasMatchVideoValidationErrors(validationErrors)) {
      return;
    }

    setIsSubmittingVideo(true);
    setVideoSubmissionError(null);

    try {
      const payload = toCreateMatchVideoDto(videoFormValues);
      const savedVideo = video ? await api.updateMatchVideo(video.id, payload) : await api.createMatchVideo(matchId, payload);
      setVideo(savedVideo);
      setIsVideoFormVisible(false);
      setIsEditingVideo(false);
      setVideoFormErrors({});
      setVideoFormValues(initialMatchVideoValues);
    } catch {
      setVideoSubmissionError('Unable to save match video metadata. Please try again.');
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const startEditVideo = () => {
    if (!video) {
      return;
    }

    setIsEditingVideo(true);
    setIsVideoFormVisible(true);
    setVideoFormValues({
      title: video.title,
      sourceType: video.sourceType,
      sourceUrl: video.sourceUrl,
      durationSeconds: video.durationSeconds !== undefined ? String(video.durationSeconds) : '',
      notes: video.notes ?? '',
    });
    setVideoFormErrors({});
    setVideoSubmissionError(null);
  };

  const deleteVideo = async () => {
    if (!video) {
      return;
    }

    setVideoSubmissionError(null);

    try {
      await api.deleteMatchVideo(video.id);
      setVideo(null);
      setIsEditingVideo(false);
      setVideoFormValues(initialMatchVideoValues);
      setIsVideoFormVisible(false);
    } catch {
      setVideoSubmissionError('Unable to remove match video metadata. Please try again.');
    }
  };

  const exportDataset = async () => {
    setIsExportingDataset(true);
    setDatasetExportError(null);

    try {
      const dataset = await api.exportMatchDataset(matchId);
      downloadDatasetAsJson(dataset, matchId);
    } catch {
      setDatasetExportError('Unable to export dataset right now. Please try again.');
    } finally {
      setIsExportingDataset(false);
    }
  };


  const validateDataset = async () => {
    setIsValidatingDataset(true);
    setDatasetValidationError(null);

    try {
      const report = await api.validateMatchDataset(matchId);
      setValidationReport(report);
    } catch {
      setDatasetValidationError('Unable to validate dataset right now. Please try again.');
    } finally {
      setIsValidatingDataset(false);
    }
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
                </button>{' '}
                <button type="button" onClick={() => void exportDataset()} disabled={isExportingDataset}>
                  {isExportingDataset ? 'Exporting...' : 'Export Dataset'}
                </button>
                {' '}
                <button type="button" onClick={() => void validateDataset()} disabled={isValidatingDataset}>
                  {isValidatingDataset ? 'Validating...' : 'Validate Dataset'}
                </button>
              </p>
              {datasetExportError ? <p>{datasetExportError}</p> : null}
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
        <section aria-labelledby="dataset-validation-heading">
          <h2 id="dataset-validation-heading">Dataset Validation</h2>

          {isValidatingDataset ? <p>Validating dataset...</p> : null}
          {datasetValidationError ? <p>{datasetValidationError}</p> : null}

          {!isValidatingDataset && !datasetValidationError && !validationReport ? (
            <p>Run validation to inspect dataset integrity before exporting.</p>
          ) : null}

          {!isValidatingDataset && !datasetValidationError && validationReport ? (
            <>
              <p>Validation status: {validationReport.isValid ? 'Valid' : 'Invalid'}</p>
              <p>Total issues: {validationReport.issueCount}</p>

              {validationReport.issues.length === 0 ? <p>No issues found. Dataset is ready for export.</p> : null}

              {(['ERROR', 'WARNING', 'INFO'] as const).map((severity) => {
                const issuesForSeverity = validationReport.issues.filter((issue) => issue.severity === severity);

                if (issuesForSeverity.length === 0) {
                  return null;
                }

                return (
                  <div key={severity}>
                    <h3>{severity}</h3>
                    <ul>
                      {issuesForSeverity.map((issue: DatasetValidationIssue, index: number) => (
                        <li key={`${severity}-${issue.type}-${index}`}>
                          <strong>{issue.type}</strong>: {issue.message}
                          {issue.context ? <pre>{JSON.stringify(issue.context, null, 2)}</pre> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </>
          ) : null}
        </section>
      ) : null}

      {!isLoadingMatch && !isMatchNotFound && !matchError ? (
        <section aria-labelledby="analytics-summary-heading">
          <h2 id="analytics-summary-heading">Analytics Summary</h2>

          {isLoadingAnalytics ? <p>Loading analytics summary...</p> : null}
          {analyticsError ? <p>{analyticsError}</p> : null}

          {!isLoadingAnalytics && !analyticsError && analytics && analytics.totalEventCount === 0 && analytics.totalPositionCount === 0 ? (
            <p>Not enough annotation data yet. Add events or position states to generate analytics.</p>
          ) : null}

          {!isLoadingAnalytics && !analyticsError && analytics && (analytics.totalEventCount > 0 || analytics.totalPositionCount > 0) ? (
            <>
              <p>Total events: {analytics.totalEventCount}</p>
              <p>Total positions: {analytics.totalPositionCount}</p>
              <p>Total tracked position time (seconds): {analytics.totalTrackedPositionTimeSeconds}</p>

              <h3>Event counts by type</h3>
              {Object.keys(analytics.eventCountsByType).length === 0 ? (
                <p>No event counts available.</p>
              ) : (
                <ul>
                  {Object.entries(analytics.eventCountsByType).map(([eventType, count]) => (
                    <li key={eventType}>
                      {eventType}: {count}
                    </li>
                  ))}
                </ul>
              )}

              <h3>Time in each position (seconds)</h3>
              <ul>
                {Object.entries(analytics.timeInPositionByTypeSeconds).map(([positionType, seconds]) => (
                  <li key={positionType}>
                    {positionType}: {seconds}
                  </li>
                ))}
              </ul>

              <h3>Top-time by competitor and position (seconds)</h3>
              {(['A', 'B'] as const).map((competitor) => (
                <div key={competitor}>
                  <h4>Competitor {competitor}</h4>
                  <ul>
                    {Object.entries(analytics.competitorTopTimeByPositionSeconds[competitor]).map(([positionType, seconds]) => (
                      <li key={`${competitor}-${positionType}`}>
                        {positionType}: {seconds}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          ) : null}
        </section>
      ) : null}

      {!isLoadingMatch && !isMatchNotFound && !matchError ? (
        <section aria-labelledby="video-review-heading">
          <h2 id="video-review-heading">Video Review</h2>

          {isLoadingVideo ? <p>Loading video metadata...</p> : null}
          {videoError ? <p>{videoError}</p> : null}

          {!isLoadingVideo && !video ? <p>No video attached yet.</p> : null}

          {!isLoadingVideo && video ? (
            <>
              <video
                controls
                src={video.sourceUrl}
                onLoadedMetadata={(event) => setVideoElement(event.currentTarget)}
                data-testid="match-video-player"
              />
              <p>Title: {video.title}</p>
              <p>Source type: {video.sourceType}</p>
              <p>Source URL: {video.sourceUrl}</p>
              {video.durationSeconds !== undefined ? <p>Duration (seconds): {video.durationSeconds}</p> : null}
              {video.notes ? <p>Notes: {video.notes}</p> : null}
              {!isVideoFormVisible ? (
                <p>
                  <button type="button" onClick={() => startEditVideo()}>
                    Edit Video
                  </button>{' '}
                  <button type="button" onClick={() => void deleteVideo()}>
                    Remove Video
                  </button>
                </p>
              ) : null}
            </>
          ) : null}

          {!isVideoFormVisible ? (
            <button type="button" onClick={() => setIsVideoFormVisible(true)}>
              {video ? 'Update Video Metadata' : 'Attach Video'}
            </button>
          ) : null}

          {isVideoFormVisible ? (
            <form onSubmit={(event) => void submitVideo(event)} noValidate>
              <h3>{isEditingVideo ? 'Edit Video' : 'Attach Video'}</h3>

              <label htmlFor="video-title">Title</label>
              <input
                id="video-title"
                name="title"
                value={videoFormValues.title}
                onChange={(event) => setVideoFormValues({ ...videoFormValues, title: event.target.value })}
              />
              {videoFormErrors.title ? <p>{videoFormErrors.title}</p> : null}

              <label htmlFor="video-source-type">Source Type</label>
              <select
                id="video-source-type"
                name="sourceType"
                value={videoFormValues.sourceType}
                onChange={(event) =>
                  setVideoFormValues({ ...videoFormValues, sourceType: event.target.value as MatchVideoFormValues['sourceType'] })
                }
              >
                <option value="">Select source type</option>
                {MATCH_VIDEO_SOURCE_TYPES.map((sourceType) => (
                  <option key={sourceType} value={sourceType}>
                    {sourceType}
                  </option>
                ))}
              </select>
              {videoFormErrors.sourceType ? <p>{videoFormErrors.sourceType}</p> : null}

              <label htmlFor="video-source-url">Source URL</label>
              <input
                id="video-source-url"
                name="sourceUrl"
                value={videoFormValues.sourceUrl}
                onChange={(event) => setVideoFormValues({ ...videoFormValues, sourceUrl: event.target.value })}
              />
              {videoFormErrors.sourceUrl ? <p>{videoFormErrors.sourceUrl}</p> : null}

              <label htmlFor="video-duration">Duration (seconds)</label>
              <input
                id="video-duration"
                name="durationSeconds"
                value={videoFormValues.durationSeconds}
                onChange={(event) => setVideoFormValues({ ...videoFormValues, durationSeconds: event.target.value })}
              />
              {videoFormErrors.durationSeconds ? <p>{videoFormErrors.durationSeconds}</p> : null}

              <label htmlFor="video-notes">Notes</label>
              <textarea
                id="video-notes"
                name="notes"
                value={videoFormValues.notes}
                onChange={(event) => setVideoFormValues({ ...videoFormValues, notes: event.target.value })}
              />

              <p>
                <button type="submit" disabled={isSubmittingVideo}>
                  {isSubmittingVideo ? 'Saving...' : isEditingVideo ? 'Save Video' : 'Attach Video'}
                </button>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsVideoFormVisible(false);
                    setIsEditingVideo(false);
                    setVideoFormValues(initialMatchVideoValues);
                    setVideoFormErrors({});
                    setVideoSubmissionError(null);
                  }}
                >
                  Cancel
                </button>
              </p>
              {videoSubmissionError ? <p>{videoSubmissionError}</p> : null}
            </form>
          ) : null}
        </section>
      ) : null}

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
        <section aria-labelledby="position-timeline-heading">
          <h2 id="position-timeline-heading">Position Timeline</h2>

          {!isPositionFormVisible ? (
            <button type="button" onClick={() => setIsPositionFormVisible(true)}>
              Add Position
            </button>
          ) : null}

          {isPositionFormVisible ? (
            <form onSubmit={(event) => void submitPosition(event)} noValidate>
              <h3>{editingPositionId ? 'Edit Position' : 'Add Position'}</h3>

              <label htmlFor="position-type">Position</label>
              <select
                id="position-type"
                name="position"
                value={positionFormValues.position}
                onChange={(event) =>
                  setPositionFormValues({
                    ...positionFormValues,
                    position: event.target.value as PositionStateFormValues['position'],
                  })
                }
              >
                <option value="">Select position</option>
                {POSITION_TYPES.map((positionType) => (
                  <option key={positionType} value={positionType}>
                    {positionType}
                  </option>
                ))}
              </select>
              {positionFormErrors.position ? <p>{positionFormErrors.position}</p> : null}

              <label htmlFor="position-competitor-top">Top Competitor</label>
              <select
                id="position-competitor-top"
                name="competitorTop"
                value={positionFormValues.competitorTop}
                onChange={(event) =>
                  setPositionFormValues({
                    ...positionFormValues,
                    competitorTop: event.target.value as PositionStateFormValues['competitorTop'],
                  })
                }
              >
                <option value="">Select competitor</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
              {positionFormErrors.competitorTop ? <p>{positionFormErrors.competitorTop}</p> : null}

              <label htmlFor="position-timestamp-start">Start Timestamp (seconds)</label>
              <input
                id="position-timestamp-start"
                name="timestampStart"
                type="number"
                min={0}
                value={positionFormValues.timestampStart}
                onChange={(event) =>
                  setPositionFormValues({ ...positionFormValues, timestampStart: event.target.value })
                }
              />
              {positionFormErrors.timestampStart ? <p>{positionFormErrors.timestampStart}</p> : null}

              <label htmlFor="position-timestamp-end">End Timestamp (seconds)</label>
              <input
                id="position-timestamp-end"
                name="timestampEnd"
                type="number"
                min={1}
                value={positionFormValues.timestampEnd}
                onChange={(event) => setPositionFormValues({ ...positionFormValues, timestampEnd: event.target.value })}
              />
              {positionFormErrors.timestampEnd ? <p>{positionFormErrors.timestampEnd}</p> : null}

              <label htmlFor="position-notes">Notes</label>
              <textarea
                id="position-notes"
                name="notes"
                value={positionFormValues.notes}
                onChange={(event) => setPositionFormValues({ ...positionFormValues, notes: event.target.value })}
              />

              <p>
                <button type="submit" disabled={isSubmittingPosition}>
                  {isSubmittingPosition ? 'Saving...' : editingPositionId ? 'Save Position' : 'Create Position'}
                </button>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsPositionFormVisible(false);
                    setEditingPositionId(null);
                    setPositionFormValues(initialPositionStateValues);
                    setPositionFormErrors({});
                    setPositionSubmissionError(null);
                  }}
                >
                  Cancel
                </button>
              </p>
              {positionSubmissionError ? <p>{positionSubmissionError}</p> : null}
            </form>
          ) : null}

          {isLoadingPositions ? <p>Loading position states...</p> : null}
          {positionsError ? <p>{positionsError}</p> : null}

          {!isLoadingPositions && !positionsError && positions.length === 0 ? <p>No position states yet.</p> : null}

          {!isLoadingPositions && !positionsError && positions.length > 0 ? (
            <ul>
              {positions.map((position) => (
                <li key={position.id}>
                  <button
                    type="button"
                    onClick={() => seekToTimestamp(position.timestampStart, { positionId: position.id })}
                    aria-pressed={selectedPositionId === position.id}
                  >
                    {formatTimestamp(position.timestampStart)} - {formatTimestamp(position.timestampEnd)} {position.position} top:{' '}
                    {position.competitorTop}
                  </button>{' '}
                  <button type="button" onClick={() => startEditPosition(position)}>
                    Edit Position
                  </button>{' '}
                  <button type="button" onClick={() => void deletePosition(position.id)}>
                    Delete Position
                  </button>
                  {position.notes ? <p>Notes: {position.notes}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
