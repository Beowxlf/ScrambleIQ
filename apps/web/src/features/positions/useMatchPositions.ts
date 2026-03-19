import { FormEvent, useEffect, useState } from 'react';

import type { PositionState } from '@scrambleiq/shared';

import {
  HttpRequestError,
  MatchNotFoundError,
  MatchesApi,
  PositionStateNotFoundError,
} from '../../matches-api';
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
  onPositionsMutated: () => void;
}

function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpRequestError) {
    return error.message;
  }

  return fallback;
}

function getLastPositionEnd(positions: PositionState[]): number | null {
  if (positions.length === 0) {
    return null;
  }

  return positions.reduce((latestEnd, position) => Math.max(latestEnd, position.timestampEnd), positions[0].timestampEnd);
}

function createAdjacentDefaults(previousEnd: number): Pick<PositionStateFormValues, 'timestampStart' | 'timestampEnd'> {
  return {
    timestampStart: String(previousEnd),
    timestampEnd: String(previousEnd + 1),
  };
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

  const updatePositionFormValues = (nextValues: PositionStateFormValues) => {
    setPositionFormValues((currentValues) => {
      if (editingPositionId !== null) {
        return nextValues;
      }

      if (nextValues.timestampStart !== currentValues.timestampStart) {
        const parsedStart = Number(nextValues.timestampStart);
        const parsedEnd = Number(nextValues.timestampEnd);
        const shouldAutoFillEnd =
          nextValues.timestampStart.trim() !== '' &&
          Number.isInteger(parsedStart) &&
          parsedStart >= 0 &&
          (nextValues.timestampEnd.trim() === '' || Number.isInteger(parsedEnd) === false || parsedEnd <= parsedStart);

        if (shouldAutoFillEnd) {
          return {
            ...nextValues,
            timestampEnd: String(parsedStart + 1),
          };
        }
      }

      return nextValues;
    });

    setPositionFormErrors({});
    setPositionSubmissionError(null);
  };

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

        setPositionFormValues(initialPositionStateValues);
        setPositionFormErrors({});
        setEditingPositionId(null);
        setIsPositionFormVisible(false);
      } else {
        const createdPosition = await api.createPositionState(matchId, toCreatePositionStateDto(positionFormValues));
        setPositions((previous) => [...previous, createdPosition].sort((a, b) => a.timestampStart - b.timestampStart));
        setPositionFormValues({
          position: positionFormValues.position,
          competitorTop: positionFormValues.competitorTop,
          notes: '',
          ...createAdjacentDefaults(createdPosition.timestampEnd),
        });
        setPositionFormErrors({});
        setEditingPositionId(null);
        setIsPositionFormVisible(true);
      }

      onPositionsMutated();
    } catch (error) {
      if (error instanceof MatchNotFoundError) {
        setPositionSubmissionError('This match is no longer available. Return to the match list and refresh.');
        return;
      }

      if (error instanceof PositionStateNotFoundError && editingPositionId) {
        setPositions((previous) => previous.filter((position) => position.id !== editingPositionId));
        setEditingPositionId(null);
        setIsPositionFormVisible(false);
        setPositionFormValues(initialPositionStateValues);
        setPositionFormErrors({});
        setPositionSubmissionError('This position state no longer exists. The list has been refreshed.');
        return;
      }

      setPositionSubmissionError(getRequestErrorMessage(error, 'Unable to save position state. Please try again.'));
    } finally {
      setIsSubmittingPosition(false);
    }
  };

  const deletePosition = async (positionId: string) => {
    setPositionSubmissionError(null);

    try {
      await api.deletePositionState(positionId);
      setPositions((previous) => previous.filter((position) => position.id !== positionId));

      onPositionsMutated();

      if (editingPositionId === positionId) {
        setEditingPositionId(null);
        setPositionFormValues(initialPositionStateValues);
        setPositionFormErrors({});
      }
    } catch (error) {
      if (error instanceof PositionStateNotFoundError) {
        setPositions((previous) => previous.filter((position) => position.id !== positionId));
        setPositionSubmissionError('This position state no longer exists. The list has been refreshed.');
        return;
      }

      setPositionSubmissionError(getRequestErrorMessage(error, 'Unable to delete position state. Please try again.'));
    }
  };

  const startCreatePosition = () => {
    const lastPositionEnd = getLastPositionEnd(positions);

    setIsPositionFormVisible(true);
    setEditingPositionId(null);
    setPositionFormValues(lastPositionEnd === null ? initialPositionStateValues : { ...initialPositionStateValues, ...createAdjacentDefaults(lastPositionEnd) });
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
    setPositionFormValues: updatePositionFormValues,
    startCreatePosition,
    startEditPosition,
    submitPosition,
    deletePosition,
    cancelPositionForm,
  };
}
