import { FormEvent, useEffect, useMemo, useState } from 'react';

import type { Match } from '@scrambleiq/shared';

import { hasValidationErrors, MatchFormValues, MatchValidationErrors, validateMatchForm } from './match';
import { createHttpMatchesApi, MatchNotFoundError, MatchesApi } from './matches-api';

const initialValues: MatchFormValues = {
  title: '',
  date: '',
  ruleset: '',
  competitorA: '',
  competitorB: '',
  notes: '',
};

type AppRoute =
  | {
      page: 'list';
    }
  | {
      page: 'detail';
      matchId: string;
    };

interface AppProps {
  matchesApi?: MatchesApi;
}

function parseRoute(pathname: string): AppRoute {
  if (pathname === '/') {
    return { page: 'list' };
  }

  const detailPathMatch = pathname.match(/^\/matches\/([^/]+)$/);

  if (detailPathMatch) {
    return {
      page: 'detail',
      matchId: decodeURIComponent(detailPathMatch[1]),
    };
  }

  return { page: 'list' };
}

function navigateTo(pathname: string) {
  window.history.pushState({}, '', pathname);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function MatchListPage({ api }: { api: MatchesApi }) {
  const [formValues, setFormValues] = useState<MatchFormValues>(initialValues);
  const [errors, setErrors] = useState<MatchValidationErrors>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMatches = async () => {
      setIsLoadingMatches(true);
      setMatchesError(null);

      try {
        const fetchedMatches = await api.listMatches();

        if (isMounted) {
          setMatches(fetchedMatches);
        }
      } catch {
        if (isMounted) {
          setMatchesError('Unable to load matches right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingMatches(false);
        }
      }
    };

    void loadMatches();

    return () => {
      isMounted = false;
    };
  }, [api]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateMatchForm(formValues);
    setErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      setSubmissionMessage(null);
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage(null);
    setSubmissionError(null);

    try {
      const createdMatch = await api.createMatch(formValues);
      setMatches((previousMatches) => [createdMatch, ...previousMatches]);
      setFormValues(initialValues);
      setErrors({});
      setSubmissionMessage('Match created successfully.');
      navigateTo(`/matches/${createdMatch.id}`);
    } catch {
      setSubmissionError('Unable to create match. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <h1>ScrambleIQ</h1>
      <p>Create a match to begin manual-first tracking and review.</p>

      <form onSubmit={(event) => void onSubmit(event)} noValidate>
        <h2>Create Match</h2>

        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={formValues.title}
          onChange={(event) => setFormValues({ ...formValues, title: event.target.value })}
        />
        {errors.title ? <p>{errors.title}</p> : null}

        <label htmlFor="date">Date</label>
        <input
          id="date"
          name="date"
          type="date"
          value={formValues.date}
          onChange={(event) => setFormValues({ ...formValues, date: event.target.value })}
        />
        {errors.date ? <p>{errors.date}</p> : null}

        <label htmlFor="ruleset">Ruleset</label>
        <input
          id="ruleset"
          name="ruleset"
          value={formValues.ruleset}
          onChange={(event) => setFormValues({ ...formValues, ruleset: event.target.value })}
        />
        {errors.ruleset ? <p>{errors.ruleset}</p> : null}

        <label htmlFor="competitorA">Competitor A</label>
        <input
          id="competitorA"
          name="competitorA"
          value={formValues.competitorA}
          onChange={(event) => setFormValues({ ...formValues, competitorA: event.target.value })}
        />
        {errors.competitorA ? <p>{errors.competitorA}</p> : null}

        <label htmlFor="competitorB">Competitor B</label>
        <input
          id="competitorB"
          name="competitorB"
          value={formValues.competitorB}
          onChange={(event) => setFormValues({ ...formValues, competitorB: event.target.value })}
        />
        {errors.competitorB ? <p>{errors.competitorB}</p> : null}

        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formValues.notes}
          onChange={(event) => setFormValues({ ...formValues, notes: event.target.value })}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Match'}
        </button>
      </form>

      {submissionMessage ? <p>{submissionMessage}</p> : null}
      {submissionError ? <p>{submissionError}</p> : null}

      <section aria-labelledby="match-list-heading">
        <h2 id="match-list-heading">Matches</h2>
        {isLoadingMatches ? <p>Loading matches...</p> : null}
        {matchesError ? <p>{matchesError}</p> : null}

        {!isLoadingMatches && !matchesError && matches.length === 0 ? <p>No matches yet.</p> : null}

        {!isLoadingMatches && !matchesError && matches.length > 0 ? (
          <ul>
            {matches.map((match) => (
              <li key={match.id}>
                <h3>{match.title}</h3>
                <p>Date: {match.date}</p>
                <p>Ruleset: {match.ruleset}</p>
                <p>Competitor A: {match.competitorA}</p>
                <p>Competitor B: {match.competitorB}</p>
                <button type="button" onClick={() => navigateTo(`/matches/${match.id}`)}>
                  View Match
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}

function MatchDetailPage({ api, matchId }: { api: MatchesApi; matchId: string }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(true);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [isMatchNotFound, setIsMatchNotFound] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editValues, setEditValues] = useState<MatchFormValues>(initialValues);
  const [editErrors, setEditErrors] = useState<MatchValidationErrors>({});
  const [editSubmissionError, setEditSubmissionError] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

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
            </article>
          )
        ) : null}
      </section>
    </main>
  );
}

export function App({ matchesApi }: AppProps) {
  const api = useMemo(() => matchesApi ?? createHttpMatchesApi(), [matchesApi]);
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.pathname));

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  if (route.page === 'detail') {
    return <MatchDetailPage api={api} matchId={route.matchId} />;
  }

  return <MatchListPage api={api} />;
}
