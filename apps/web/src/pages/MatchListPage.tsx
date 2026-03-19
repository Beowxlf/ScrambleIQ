import { CSSProperties, FormEvent, useState } from 'react';

import { MatchCreateForm } from '../components/MatchCreateForm';
import { MatchList } from '../components/MatchList';
import { useMatches } from '../hooks/useMatches';
import { hasValidationErrors, MatchFormValues, MatchValidationErrors, validateMatchForm } from '../match';
import type { MatchesApi } from '../matches-api';

const initialValues: MatchFormValues = {
  title: '',
  date: '',
  ruleset: '',
  competitorA: '',
  competitorB: '',
  notes: '',
};

interface MatchListPageProps {
  api: MatchesApi;
  onOpenMatch: (matchId: string) => void;
}

const pageStyles: Record<string, CSSProperties> = {
  layout: {
    display: 'grid',
    gap: '1.25rem',
  },
  introCard: {
    backgroundColor: '#f4f7fc',
    border: '1px solid #d8e0ec',
    borderRadius: '10px',
    padding: '1rem 1.1rem',
  },
  introHeading: {
    fontSize: '1.25rem',
    margin: 0,
  },
  introText: {
    margin: '0.5rem 0 0',
    color: '#3b4a61',
  },
  columns: {
    display: 'grid',
    gap: '1.25rem',
    gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)',
    alignItems: 'start',
  },
  statusMessage: {
    margin: '0.65rem 0 0',
    fontWeight: 500,
  },
  statusSuccess: {
    color: '#1b5e20',
  },
  statusError: {
    color: '#842029',
  },
};

export function MatchListPage({ api, onOpenMatch }: MatchListPageProps) {
  const [formValues, setFormValues] = useState<MatchFormValues>(initialValues);
  const [errors, setErrors] = useState<MatchValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const { matches, isLoadingMatches, matchesError, filters } = useMatches({ api });

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
      setFormValues(initialValues);
      setErrors({});
      setSubmissionMessage('Match created successfully.');
      onOpenMatch(createdMatch.id);
    } catch {
      setSubmissionError('Unable to create match. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-page">
      <header className="app-header">
        <h1>ScrambleIQ</h1>
        <p className="muted">Create a match to begin manual-first tracking and review.</p>
      </header>

      <div style={pageStyles.columns}>
        <aside aria-label="Create match panel">
          <MatchCreateForm
            formValues={formValues}
            errors={errors}
            isSubmitting={isSubmitting}
            onChange={setFormValues}
            onSubmit={onSubmit}
          />

      {submissionMessage ? <p>{submissionMessage}</p> : null}
      {submissionError ? <p className="status-error">{submissionError}</p> : null}

        <section aria-label="Match list panel">
          <MatchList
            matches={matches}
            isLoadingMatches={isLoadingMatches}
            matchesError={matchesError}
            competitorFilter={filters.competitorFilter}
            dateFromFilter={filters.dateFromFilter}
            dateToFilter={filters.dateToFilter}
            hasVideoOnly={filters.hasVideoOnly}
            pageSize={filters.limit}
            pageOffset={filters.offset}
            totalMatches={filters.total}
            onCompetitorFilterChange={filters.setCompetitorFilter}
            onDateFromFilterChange={filters.setDateFromFilter}
            onDateToFilterChange={filters.setDateToFilter}
            onHasVideoOnlyChange={filters.setHasVideoOnly}
            onPageSizeChange={filters.setLimit}
            onPreviousPage={filters.goToPreviousPage}
            onNextPage={filters.goToNextPage}
            onViewMatch={onOpenMatch}
          />
        </section>
      </div>
    </main>
  );
}
