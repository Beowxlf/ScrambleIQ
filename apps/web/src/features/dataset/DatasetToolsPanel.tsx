import type { MatchesApi } from '../../matches-api';
import { DatasetValidationReport } from './DatasetValidationReport';
import { useMatchDatasetTools } from './useMatchDatasetTools';

interface DatasetToolsPanelProps {
  api: MatchesApi;
  matchId: string;
}

export function DatasetToolsPanel({ api, matchId }: DatasetToolsPanelProps) {
  const {
    datasetExportError,
    datasetValidationError,
    exportDataset,
    isExportingDataset,
    isValidatingDataset,
    validateDataset,
    validationReport,
  } = useMatchDatasetTools({ api, matchId });

  return (
    <section aria-labelledby="dataset-validation-heading">
      <h2 id="dataset-validation-heading">Dataset Validation</h2>
      <p>
        <button type="button" onClick={() => void exportDataset()} disabled={isExportingDataset}>
          {isExportingDataset ? 'Exporting...' : 'Export Dataset'}
        </button>{' '}
        <button type="button" onClick={() => void validateDataset()} disabled={isValidatingDataset}>
          {isValidatingDataset ? 'Validating...' : 'Validate Dataset'}
        </button>
      </p>

      {datasetExportError ? <p>{datasetExportError}</p> : null}
      {isValidatingDataset ? <p>Validating dataset...</p> : null}
      {datasetValidationError ? <p>{datasetValidationError}</p> : null}

      {!isValidatingDataset && !datasetValidationError && !validationReport ? (
        <p>Run validation to inspect dataset integrity before exporting.</p>
      ) : null}

      {!isValidatingDataset && !datasetValidationError && validationReport ? (
        <DatasetValidationReport validationReport={validationReport} />
      ) : null}
    </section>
  );
}
