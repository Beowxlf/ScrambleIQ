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

  const hasBlockingValidationIssues = validationReport ? validationReport.issues.some((issue) => issue.severity === 'ERROR') : false;

  return (
    <section aria-labelledby="dataset-validation-heading">
      <h2 id="dataset-validation-heading">Dataset Validation</h2>
      <p>Validate first, then export a JSON snapshot for manual review and downstream processing.</p>

      <h3>Actions</h3>
      <p>
        <button type="button" onClick={() => void validateDataset()} disabled={isValidatingDataset}>
          {isValidatingDataset ? 'Validating...' : 'Validate Dataset'}
        </button>{' '}
        <button type="button" onClick={() => void exportDataset()} disabled={isExportingDataset}>
          {isExportingDataset ? 'Exporting...' : 'Export Dataset'}
        </button>
      </p>

      {datasetExportError ? <p>{datasetExportError}</p> : null}
      {isValidatingDataset ? <p>Validating dataset...</p> : null}
      {datasetValidationError ? <p>{datasetValidationError}</p> : null}

      {!isValidatingDataset && !datasetValidationError && !validationReport ? (
        <p>Run validation to inspect dataset integrity before exporting.</p>
      ) : null}

      {!isValidatingDataset && !datasetValidationError && validationReport ? (
        <>
          <h3>Export readiness</h3>
          <p>
            {validationReport.isValid
              ? 'Ready to export: no blocking validation issues were found.'
              : hasBlockingValidationIssues
                ? 'Blocked for export: resolve blocking issues before relying on this dataset.'
                : 'Export with caution: no blocking issues, but warnings should be reviewed.'}
          </p>
          <DatasetValidationReport validationReport={validationReport} />
        </>
      ) : null}
    </section>
  );
}
