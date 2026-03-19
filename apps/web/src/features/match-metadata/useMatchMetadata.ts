import { FormEvent, useEffect, useState } from 'react';

import type { Match } from '@scrambleiq/shared';

import { hasValidationErrors, MatchFormValues, MatchValidationErrors, validateMatchForm } from '../../match';
import { HttpRequestError, MatchNotFoundError, type MatchesApi } from '../../matches-api';

const initialValues: MatchFormValues = {
  title: '',
  date: '',
  ruleset: '',
  competitorA: '',
  competitorB: '',
  notes: '',
};

interface UseMatchMetadataArgs {
  api: MatchesApi;
  matchId: string;
  onMatchDeleted: () => void;
}

function toMatchFormValues(match: Match): MatchFormValues {
  return {
    title: match.title,
    date: match.date,
    ruleset: match.ruleset,
    competitorA: match.competitorA,
    competitorB: match.competitorB,
    notes: match.notes,
  };
}

function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpRequestError) {
    return error.message;
  }

  return fallback;
}

export function useMatchMetadata({ api, matchId, onMatchDeleted }: UseMatchMetadataArgs) {
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

  useEffect(() => {
    let isMounted = true;

    const loadMatch = async () => {
      setIsLoadingMatch(true);
      setMatch(null);
      setMatchError(null);
      setIsMatchNotFound(false);
      setIsEditMode(false);
      setEditValues(initialValues);
      setEditSubmissionError(null);
      setEditErrors({});
      setIsDeleteConfirming(false);
      setIsDeleting(false);
      setDeleteError(null);

      try {
        const fetchedMatch = await api.getMatch(matchId);

        if (isMounted) {
          setMatch(fetchedMatch);
          setEditValues(toMatchFormValues(fetchedMatch));
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
      setEditValues(toMatchFormValues(updatedMatch));
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

  const startEdit = () => {
    if (!match) {
      return;
    }

    setEditValues(toMatchFormValues(match));
    setEditErrors({});
    setEditSubmissionError(null);
    setIsEditMode(true);
  };

  const cancelEdit = () => {
    if (!match) {
      return;
    }

    setIsEditMode(false);
    setEditSubmissionError(null);
    setEditErrors({});
    setEditValues(toMatchFormValues(match));
  };

  const setEditValue = (field: keyof MatchFormValues, value: string) => {
    setEditValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const startDeleteConfirmation = () => {
    setIsDeleteConfirming(true);
    setDeleteError(null);
  };

  const cancelDeleteConfirmation = () => {
    setIsDeleteConfirming(false);
    setDeleteError(null);
  };

  const deleteMatch = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await api.deleteMatch(matchId);
      onMatchDeleted();
    } catch (error) {
      if (error instanceof MatchNotFoundError) {
        onMatchDeleted();
        return;
      }

      setDeleteError(getRequestErrorMessage(error, 'Unable to delete match. Please try again.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return {
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
    submitEdit,
    startEdit,
    cancelEdit,
    setEditValue,
    startDeleteConfirmation,
    cancelDeleteConfirmation,
    deleteMatch,
  };
}
