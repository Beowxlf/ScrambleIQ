import { FormEvent, useEffect, useMemo, useState } from 'react';

import { hasValidationErrors, Match, MatchFormValues, MatchValidationErrors, validateMatchForm } from './match';
import { createHttpMatchesApi, MatchNotFoundError, MatchesApi } from './matches-api';

const initialValues: MatchFormValues = {
  title: '',
  date: '',
  ruleset: '',
  competitorA: '',
  competitorB: '',
  notes: '',
};

interface AppProps {
  matchesApi?: MatchesApi;
}

export function App({ matchesApi }: AppProps) {
  const api = useMemo(() => matchesApi ?? createHttpMatchesApi(), [matchesApi]);

  const [formValues, setFormValues] = useState<MatchFormValues>(initialValues);
  const [errors, setErrors] = useState<MatchValidationErrors>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isLoadingSelectedMatch, setIsLoadingSelectedMatch] = useState(false);
  const [selectedMatchError, setSelectedMatchError] = useState<string | null>(null);
  const [isSelectedMatchNotFound, setIsSelectedMatchNotFound] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    const loadSelectedMatch = async () => {
      if (!selectedMatchId) {
        setSelectedMatch(null);
        setSelectedMatchError(null);
        setIsSelectedMatchNotFound(false);
        setIsLoadingSelectedMatch(false);
        return;
      }

      setIsLoadingSelectedMatch(true);
      setSelectedMatch(null);
      setSelectedMatchError(null);
      setIsSelectedMatchNotFound(false);

      try {
        const match = await api.getMatch(selectedMatchId);

        if (isMounted) {
          setSelectedMatch(match);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof MatchNotFoundError) {
          setIsSelectedMatchNotFound(true);
          return;
        }

        setSelectedMatchError('Unable to load match details right now.');
      } finally {
        if (isMounted) {
          setIsLoadingSelectedMatch(false);
        }
      }
    };

    void loadSelectedMatch();

    return () => {
      isMounted = false;
    };
  }, [api, selectedMatchId]);

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
      setSelectedMatchId(createdMatch.id);
      setFormValues(initialValues);
      setErrors({});
      setSubmissionMessage('Match created successfully.');
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
                <button type="button" onClick={() => setSelectedMatchId(match.id)}>
                  View Match
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section aria-labelledby="match-detail-heading">
        <h2 id="match-detail-heading">Match Detail</h2>

        {!selectedMatchId ? <p>Select a match to view details.</p> : null}
        {selectedMatchId && isLoadingSelectedMatch ? <p>Loading match details...</p> : null}
        {selectedMatchId && !isLoadingSelectedMatch && isSelectedMatchNotFound ? <p>Match not found.</p> : null}
        {selectedMatchId && !isLoadingSelectedMatch && selectedMatchError ? <p>{selectedMatchError}</p> : null}

        {selectedMatchId && !isLoadingSelectedMatch && selectedMatch ? (
          <article>
            <h3>{selectedMatch.title}</h3>
            <p>ID: {selectedMatch.id}</p>
            <p>Date: {selectedMatch.date}</p>
            <p>Ruleset: {selectedMatch.ruleset}</p>
            <p>Competitor A: {selectedMatch.competitorA}</p>
            <p>Competitor B: {selectedMatch.competitorB}</p>
            <p>Notes: {selectedMatch.notes || 'No notes provided.'}</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}
