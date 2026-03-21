import { FormEvent, useEffect, useMemo, useState } from 'react';

import type { SavedReviewPreset, SavedReviewPresetConfig, SavedReviewPresetMetadata } from '@scrambleiq/shared';

import {
  HttpRequestError,
  SavedReviewPresetNotFoundError,
  type MatchesApi,
} from '../../matches-api';
import {
  hasReviewPresetValidationErrors,
  initialReviewPresetFormValues,
  toCreateSavedReviewPresetDto,
  toReviewPresetFormValues,
  toUpdateSavedReviewPresetDto,
  validateReviewPresetForm,
  type ReviewPresetFormValues,
  type ReviewPresetValidationErrors,
} from '../../review-preset';

interface UseSavedReviewPresetsArgs {
  api: MatchesApi;
  onApplyReviewSettings: (config: SavedReviewPresetConfig) => void;
  reviewSettings: SavedReviewPresetConfig;
}

function isSavedReviewPresetApiAvailable(api: MatchesApi): boolean {
  return Boolean(
    api.listSavedReviewPresets
      && api.getSavedReviewPreset
      && api.createSavedReviewPreset
      && api.updateSavedReviewPreset
      && api.deleteSavedReviewPreset,
  );
}

function toSummaryText(config: SavedReviewPresetConfig): string {
  const parts: string[] = [];

  if (config.eventTypeFilters && config.eventTypeFilters.length > 0) {
    parts.push(`event types: ${config.eventTypeFilters.join(', ')}`);
  }

  if (config.competitorFilter) {
    parts.push(`competitor: ${config.competitorFilter}`);
  }

  if (config.positionFilters && config.positionFilters.length > 0) {
    parts.push(`positions: ${config.positionFilters.join(', ')}`);
  }

  if (config.showOnlyValidationIssues) {
    parts.push('show only validation issues: yes');
  }

  if (parts.length === 0) {
    return 'No additional filters. Preset keeps all review data visible.';
  }

  return parts.join(' | ');
}

export function useSavedReviewPresets({ api, onApplyReviewSettings, reviewSettings }: UseSavedReviewPresetsArgs) {
  const [presets, setPresets] = useState<SavedReviewPresetMetadata[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(true);
  const [presetsError, setPresetsError] = useState<string | null>(null);
  const [isPresetFormVisible, setIsPresetFormVisible] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<SavedReviewPreset | null>(null);
  const [presetFormValues, setPresetFormValues] = useState<ReviewPresetFormValues>(initialReviewPresetFormValues);
  const [presetFormErrors, setPresetFormErrors] = useState<ReviewPresetValidationErrors>({});
  const [presetSubmissionError, setPresetSubmissionError] = useState<string | null>(null);
  const [isSubmittingPreset, setIsSubmittingPreset] = useState(false);
  const [activePresetName, setActivePresetName] = useState<string | null>(null);

  const hasApiSupport = useMemo(() => isSavedReviewPresetApiAvailable(api), [api]);

  useEffect(() => {
    const listSavedReviewPresets = api.listSavedReviewPresets;

    if (!hasApiSupport || !listSavedReviewPresets) {
      setIsLoadingPresets(false);
      setPresetsError('Saved review preset APIs are unavailable in the current runtime.');
      return;
    }

    let isMounted = true;

    const loadPresets = async () => {
      setIsLoadingPresets(true);
      setPresetsError(null);
      try {
        const listedPresets = await listSavedReviewPresets();

        if (isMounted) {
          setPresets(listedPresets);
        }
      } catch {
        if (isMounted) {
          setPresetsError('Unable to load saved review presets right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingPresets(false);
        }
      }
    };

    void loadPresets();

    return () => {
      isMounted = false;
    };
  }, [api, hasApiSupport]);

  const startCreatePreset = () => {
    setIsPresetFormVisible(true);
    setEditingPresetId(null);
    setSelectedPreset(null);
    setPresetFormValues(toReviewPresetFormValues({ name: '', description: undefined, config: reviewSettings }));
    setPresetFormErrors({});
    setPresetSubmissionError(null);
  };

  const selectPreset = async (presetId: string) => {
    if (!api.getSavedReviewPreset) {
      return;
    }

    setPresetSubmissionError(null);

    try {
      const preset = await api.getSavedReviewPreset(presetId);
      setSelectedPreset(preset);
      setEditingPresetId(null);
      setIsPresetFormVisible(false);
    } catch (error) {
      if (error instanceof SavedReviewPresetNotFoundError) {
        setPresets((currentPresets) => currentPresets.filter((preset) => preset.id !== presetId));
        setPresetSubmissionError('This saved preset no longer exists. The preset list has been refreshed.');
        return;
      }

      setPresetSubmissionError('Unable to load saved review preset details right now.');
    }
  };

  const startEditPreset = async (presetId: string) => {
    if (!api.getSavedReviewPreset) {
      return;
    }

    setPresetSubmissionError(null);

    try {
      const preset = await api.getSavedReviewPreset(presetId);
      setSelectedPreset(preset);
      setEditingPresetId(preset.id);
      setPresetFormValues(toReviewPresetFormValues(preset));
      setPresetFormErrors({});
      setIsPresetFormVisible(true);
    } catch (error) {
      if (error instanceof SavedReviewPresetNotFoundError) {
        setPresets((currentPresets) => currentPresets.filter((preset) => preset.id !== presetId));
        setPresetSubmissionError('This saved preset no longer exists. The preset list has been refreshed.');
        return;
      }

      setPresetSubmissionError('Unable to load saved review preset details right now.');
    }
  };

  const submitPreset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!api.createSavedReviewPreset || !api.updateSavedReviewPreset) {
      return;
    }

    const validationErrors = validateReviewPresetForm(presetFormValues);
    setPresetFormErrors(validationErrors);

    if (hasReviewPresetValidationErrors(validationErrors)) {
      return;
    }

    setIsSubmittingPreset(true);
    setPresetSubmissionError(null);

    try {
      if (editingPresetId) {
        const updatedPreset = await api.updateSavedReviewPreset(editingPresetId, toUpdateSavedReviewPresetDto(presetFormValues));

        setPresets((currentPresets) =>
          currentPresets.map((preset) => (preset.id === updatedPreset.id
            ? {
              id: updatedPreset.id,
              name: updatedPreset.name,
              description: updatedPreset.description,
              scope: updatedPreset.scope,
              createdAt: updatedPreset.createdAt,
              updatedAt: updatedPreset.updatedAt,
            }
            : preset)),
        );

        setSelectedPreset(updatedPreset);
        if (activePresetName) {
          setActivePresetName(updatedPreset.name);
        }
      } else {
        const createdPreset = await api.createSavedReviewPreset(toCreateSavedReviewPresetDto(presetFormValues));

        setPresets((currentPresets) => [...currentPresets, {
          id: createdPreset.id,
          name: createdPreset.name,
          description: createdPreset.description,
          scope: createdPreset.scope,
          createdAt: createdPreset.createdAt,
          updatedAt: createdPreset.updatedAt,
        }]);

        setSelectedPreset(createdPreset);
      }

      setIsPresetFormVisible(false);
      setEditingPresetId(null);
      setPresetFormValues(initialReviewPresetFormValues);
      setPresetFormErrors({});
    } catch (error) {
      if (error instanceof SavedReviewPresetNotFoundError) {
        setPresets((currentPresets) => currentPresets.filter((preset) => preset.id !== editingPresetId));
        setPresetSubmissionError('This saved preset no longer exists. The preset list has been refreshed.');
        return;
      }

      if (error instanceof HttpRequestError) {
        setPresetSubmissionError(error.message);
        return;
      }

      setPresetSubmissionError('Unable to save saved review preset. Please try again.');
    } finally {
      setIsSubmittingPreset(false);
    }
  };

  const cancelPresetForm = () => {
    setIsPresetFormVisible(false);
    setEditingPresetId(null);
    setPresetFormValues(initialReviewPresetFormValues);
    setPresetFormErrors({});
    setPresetSubmissionError(null);
  };

  const deletePreset = async (presetId: string) => {
    if (!api.deleteSavedReviewPreset) {
      return;
    }

    setIsSubmittingPreset(true);
    setPresetSubmissionError(null);

    try {
      await api.deleteSavedReviewPreset(presetId);
      setPresets((currentPresets) => currentPresets.filter((preset) => preset.id !== presetId));

      if (selectedPreset?.id === presetId) {
        setSelectedPreset(null);
      }
    } catch (error) {
      if (error instanceof SavedReviewPresetNotFoundError) {
        setPresets((currentPresets) => currentPresets.filter((preset) => preset.id !== presetId));
        if (selectedPreset?.id === presetId) {
          setSelectedPreset(null);
        }
        setPresetSubmissionError('This saved preset no longer exists. The preset list has been refreshed.');
        return;
      }

      setPresetSubmissionError('Unable to delete saved review preset. Please try again.');
    } finally {
      setIsSubmittingPreset(false);
    }
  };

  const applyPreset = async (presetId: string) => {
    if (!api.getSavedReviewPreset) {
      return;
    }

    setIsSubmittingPreset(true);
    setPresetSubmissionError(null);

    try {
      const preset = await api.getSavedReviewPreset(presetId);
      setSelectedPreset(preset);
      setActivePresetName(preset.name);
      onApplyReviewSettings(preset.config);
    } catch (error) {
      if (error instanceof SavedReviewPresetNotFoundError) {
        setPresets((currentPresets) => currentPresets.filter((preset) => preset.id !== presetId));
        setPresetSubmissionError('This saved preset no longer exists. The preset list has been refreshed.');
        return;
      }

      setPresetSubmissionError('Unable to apply saved review preset right now.');
    } finally {
      setIsSubmittingPreset(false);
    }
  };

  const handleManualSettingsChange = (config: SavedReviewPresetConfig) => {
    onApplyReviewSettings(config);
    setActivePresetName(null);
  };

  const activeSettingsSummary = toSummaryText(reviewSettings);

  return {
    presets,
    isLoadingPresets,
    presetsError,
    isPresetFormVisible,
    editingPresetId,
    selectedPreset,
    presetFormValues,
    presetFormErrors,
    presetSubmissionError,
    isSubmittingPreset,
    hasApiSupport,
    activePresetName,
    activeSettingsSummary,
    setPresetFormValues,
    startCreatePreset,
    selectPreset,
    startEditPreset,
    submitPreset,
    cancelPresetForm,
    deletePreset,
    applyPreset,
    handleManualSettingsChange,
  };
}
