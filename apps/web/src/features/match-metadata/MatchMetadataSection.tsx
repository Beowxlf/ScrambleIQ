import type { FormEvent } from 'react';

import type { MatchFormValues, MatchValidationErrors } from '../../match';
import type { Match } from '@scrambleiq/shared';

interface MatchMetadataSectionProps {
  match: Match | null;
  isLoadingMatch: boolean;
  matchError: string | null;
  isMatchNotFound: boolean;
  isEditMode: boolean;
  editValues: MatchFormValues;
  editErrors: MatchValidationErrors;
  editSubmissionError: string | null;
  isSubmittingEdit: boolean;
  isDeleteConfirming: boolean;
  isDeleting: boolean;
  deleteError: string | null;
  onSubmitEdit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onEditValueChange: (field: keyof MatchFormValues, value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onStartDeleteConfirmation: () => void;
  onCancelDeleteConfirmation: () => void;
  onDeleteMatch: () => Promise<void>;
}

export function MatchMetadataSection({
  match,
  isLoadingMatch,
  matchError,
  isMatchNotFound,
  isEditMode,
  editValues,
  editErrors,
  editSubmissionError,
  isSubmittingEdit,
  isDeleteConfirming,
  isDeleting,
  deleteError,
  onSubmitEdit,
  onEditValueChange,
  onStartEdit,
  onCancelEdit,
  onStartDeleteConfirmation,
  onCancelDeleteConfirmation,
  onDeleteMatch,
}: MatchMetadataSectionProps) {
  return (
    <section aria-labelledby="match-detail-heading" className="surface-card">
      <h2 id="match-detail-heading">Match Detail</h2>

      {isLoadingMatch ? <p>Loading match details...</p> : null}
      {!isLoadingMatch && isMatchNotFound ? <p>Match not found.</p> : null}
      {!isLoadingMatch && matchError ? <p>{matchError}</p> : null}

      {!isLoadingMatch && match ? (
        isEditMode ? (
          <form onSubmit={(event) => void onSubmitEdit(event)} noValidate>
            <h3>Edit Match</h3>

            <label htmlFor="edit-title">Title</label>
            <input id="edit-title" name="title" value={editValues.title} onChange={(event) => onEditValueChange('title', event.target.value)} />
            {editErrors.title ? <p className="form-error">{editErrors.title}</p> : null}

            <label htmlFor="edit-date">Date</label>
            <input
              id="edit-date"
              name="date"
              type="date"
              value={editValues.date}
              onChange={(event) => onEditValueChange('date', event.target.value)}
            />
            {editErrors.date ? <p className="form-error">{editErrors.date}</p> : null}

            <label htmlFor="edit-ruleset">Ruleset</label>
            <input
              id="edit-ruleset"
              name="ruleset"
              value={editValues.ruleset}
              onChange={(event) => onEditValueChange('ruleset', event.target.value)}
            />
            {editErrors.ruleset ? <p className="form-error">{editErrors.ruleset}</p> : null}

            <label htmlFor="edit-competitorA">Competitor A</label>
            <input
              id="edit-competitorA"
              name="competitorA"
              value={editValues.competitorA}
              onChange={(event) => onEditValueChange('competitorA', event.target.value)}
            />
            {editErrors.competitorA ? <p className="form-error">{editErrors.competitorA}</p> : null}

            <label htmlFor="edit-competitorB">Competitor B</label>
            <input
              id="edit-competitorB"
              name="competitorB"
              value={editValues.competitorB}
              onChange={(event) => onEditValueChange('competitorB', event.target.value)}
            />
            {editErrors.competitorB ? <p className="form-error">{editErrors.competitorB}</p> : null}

            <label htmlFor="edit-notes">Notes</label>
            <textarea id="edit-notes" name="notes" value={editValues.notes} onChange={(event) => onEditValueChange('notes', event.target.value)} />

            <div className="button-row">
              <button type="submit" disabled={isSubmittingEdit}>
                {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={onCancelEdit}>
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
              <button type="button" onClick={onStartEdit}>
                Edit Match
              </button>
            </div>
            <div>
              {!isDeleteConfirming ? (
                <button type="button" className="button-danger" onClick={onStartDeleteConfirmation} disabled={isDeleting}>
                  Delete Match
                </button>
              ) : (
                <>
                  <p>Are you sure you want to delete this match?</p>
                  <div className="button-row">
                    <button type="button" className="button-danger" onClick={() => void onDeleteMatch()} disabled={isDeleting}>
                      {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button type="button" onClick={onCancelDeleteConfirmation} disabled={isDeleting}>
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
  );
}
