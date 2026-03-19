import { FormEvent, useState } from 'react';

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
    <main>
      <header className="app-header">
        <h1>Match List</h1>
        <p className="muted">Create a match to begin manual-first tracking and review.</p>
      </header>

      <div className="two-column-layout">
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
        </aside>

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
