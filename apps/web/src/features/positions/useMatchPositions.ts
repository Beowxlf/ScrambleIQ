import { FormEvent, useEffect, useState } from 'react';

import type { PositionState } from '@scrambleiq/shared';

import { MatchNotFoundError, MatchesApi } from '../../matches-api';
import {
  hasPositionStateValidationErrors,
  initialPositionStateValues,
  PositionStateFormValues,
  PositionStateValidationErrors,
  toCreatePositionStateDto,
  validatePositionStateForm,
} from '../../position-state';

interface UseMatchPositionsArgs {
  api: MatchesApi;
  matchId: string;
  onPositionsMutated: () => Promise<void>;
}

export function useMatchPositions({ api, matchId, onPositionsMutated }: UseMatchPositionsArgs) {
  const [positions, setPositions] = useState<PositionState[]>([]);
  const [positionsError, setPositionsError] = useState<string | null>(null);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);
  const [isPositionFormVisible, setIsPositionFormVisible] = useState(false);
  const [positionFormValues, setPositionFormValues] = useState<PositionStateFormValues>(initialPositionStateValues);
  const [positionFormErrors, setPositionFormErrors] = useState<PositionStateValidationErrors>({});
  const [isSubmittingPosition, setIsSubmittingPosition] = useState(false);
  const [positionSubmissionError, setPositionSubmissionError] = useState<string | null>(null);
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

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

    return () => {
      isMounted = false;
    };
  }, [api, matchId]);

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
      await onPositionsMutated();
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

      await onPositionsMutated();

      if (editingPositionId === positionId) {
        setEditingPositionId(null);
        setPositionFormValues(initialPositionStateValues);
        setPositionFormErrors({});
      }
    } catch {
      setPositionSubmissionError('Unable to delete position state. Please try again.');
    }
  };

  const startCreatePosition = () => {
    setIsPositionFormVisible(true);
    setEditingPositionId(null);
    setPositionFormValues(initialPositionStateValues);
    setPositionFormErrors({});
    setPositionSubmissionError(null);
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

  const cancelPositionForm = () => {
    setIsPositionFormVisible(false);
    setEditingPositionId(null);
    setPositionFormValues(initialPositionStateValues);
    setPositionFormErrors({});
    setPositionSubmissionError(null);
  };

  return {
    positions,
    positionsError,
    isLoadingPositions,
    isPositionFormVisible,
    positionFormValues,
    positionFormErrors,
    isSubmittingPosition,
    positionSubmissionError,
    editingPositionId,
    setPositionFormValues,
    startCreatePosition,
    startEditPosition,
    submitPosition,
    deletePosition,
    cancelPositionForm,
  };
}
