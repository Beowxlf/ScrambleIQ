import type { SavedReviewPresetConfig } from '@scrambleiq/shared';

import type { MatchesApi } from '../../matches-api';
import { toReviewPresetFormValues } from '../../review-preset';
import { ReviewSettingsForm, SavedReviewPresetForm } from './SavedReviewPresetForm';
import { SavedReviewPresetList } from './SavedReviewPresetList';
import { useSavedReviewPresets } from './useSavedReviewPresets';

interface SavedReviewPresetPanelProps {
  api: MatchesApi;
  reviewSettings: SavedReviewPresetConfig;
  onApplyReviewSettings: (config: SavedReviewPresetConfig) => void;
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
    return 'No additional filters.';
  }

  return parts.join(' | ');
}

export function SavedReviewPresetPanel({ api, reviewSettings, onApplyReviewSettings }: SavedReviewPresetPanelProps) {
  const {
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
  } = useSavedReviewPresets({ api, onApplyReviewSettings, reviewSettings });

  if (!hasApiSupport) {
    return (
      <section aria-labelledby="saved-review-presets-heading">
        <h2 id="saved-review-presets-heading">Saved Review Presets</h2>
        <p>{presetsError}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="saved-review-presets-heading">
      <h2 id="saved-review-presets-heading">Saved Review Presets</h2>
      <p>
        Save and re-apply manual review settings for this workspace. Applying a preset updates visible review settings only.
      </p>

      <p>Current settings summary: {activeSettingsSummary}</p>

      <ReviewSettingsForm
        values={toReviewPresetFormValues({
          name: '',
          config: reviewSettings,
        })}
        activePresetName={activePresetName}
        onChange={handleManualSettingsChange}
      />

      {!isPresetFormVisible ? (
        <button type="button" onClick={startCreatePreset}>
          Create Saved Review Preset
        </button>
      ) : null}

      {isPresetFormVisible ? (
        <SavedReviewPresetForm
          values={presetFormValues}
          errors={presetFormErrors}
          isSubmitting={isSubmittingPreset}
          isEditing={editingPresetId !== null}
          submissionError={presetSubmissionError}
          onChange={setPresetFormValues}
          onSubmit={submitPreset}
          onCancel={cancelPresetForm}
        />
      ) : null}

      {!isPresetFormVisible && presetSubmissionError ? <p className="status-error">{presetSubmissionError}</p> : null}

      {isLoadingPresets ? <p>Loading saved review presets...</p> : null}

      {!isLoadingPresets ? (
        <SavedReviewPresetList
          presets={presets}
          selectedPresetId={selectedPreset?.id ?? null}
          onSelectPreset={(presetId) => void selectPreset(presetId)}
          onEditPreset={(presetId) => void startEditPreset(presetId)}
          onDeletePreset={(presetId) => void deletePreset(presetId)}
          onApplyPreset={(presetId) => void applyPreset(presetId)}
          isApplyingPreset={isSubmittingPreset}
        />
      ) : null}

      {selectedPreset ? (
        <article>
          <h3>Selected Preset</h3>
          <p>{selectedPreset.name}</p>
          <p>{selectedPreset.description || 'No description provided.'}</p>
          <p>{`Scope: ${selectedPreset.scope}`}</p>
          <p>{`Config summary: ${toSummaryText(selectedPreset.config)}`}</p>
        </article>
      ) : null}
    </section>
  );
}
