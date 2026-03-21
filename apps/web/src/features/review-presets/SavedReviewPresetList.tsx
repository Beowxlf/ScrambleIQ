import type { SavedReviewPresetMetadata } from '@scrambleiq/shared';

interface SavedReviewPresetListProps {
  presets: SavedReviewPresetMetadata[];
  selectedPresetId: string | null;
  onSelectPreset: (presetId: string) => void;
  onEditPreset: (presetId: string) => void;
  onDeletePreset: (presetId: string) => void;
  onApplyPreset: (presetId: string) => void;
  isApplyingPreset: boolean;
}

export function SavedReviewPresetList({
  presets,
  selectedPresetId,
  onSelectPreset,
  onEditPreset,
  onDeletePreset,
  onApplyPreset,
  isApplyingPreset,
}: SavedReviewPresetListProps) {
  if (presets.length === 0) {
    return <p>No saved review presets yet.</p>;
  }

  return (
    <ul className="match-list-results" aria-label="Saved review presets list">
      {presets.map((preset) => (
        <li key={preset.id} className="match-list-item">
          <div className="match-list-item__header">
            <div>
              <h4>{preset.name}</h4>
              <p>{preset.description || 'No description provided.'}</p>
            </div>
          </div>
          <div>
            <button type="button" onClick={() => onSelectPreset(preset.id)} disabled={selectedPresetId === preset.id}>
              View Preset
            </button>
            <button type="button" onClick={() => onEditPreset(preset.id)}>
              Edit Preset
            </button>
            <button type="button" onClick={() => onDeletePreset(preset.id)}>
              Delete Preset
            </button>
            <button type="button" onClick={() => onApplyPreset(preset.id)} disabled={isApplyingPreset}>
              Apply in Review Workflow
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
