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
  const hasValidationWarnings = validationReport ? validationReport.issues.some((issue) => issue.severity === 'WARNING') : false;
  const validationNotRun = !isValidatingDataset && !datasetValidationError && !validationReport;

  const exportReadinessMessage = (() => {
    if (isValidatingDataset) {
      return 'Validation in progress. Wait for results before deciding whether this export is production-ready.';
    }

    if (datasetValidationError) {
      return 'Validation unavailable. Export is still possible, but treat the artifact as risky until validation succeeds.';
    }

    if (!validationReport) {
      return 'Validation not run yet. Export is available for manual review, but readiness is unknown.';
    }

    if (validationReport.isValid) {
      return 'Ready to export: no blocking validation issues were found.';
    }

    if (hasBlockingValidationIssues) {
      return 'Risky export: blocking validation issues were found. Export only for debugging or manual inspection.';
    }

    if (hasValidationWarnings) {
      return 'Export with caution: no blocking issues, but warnings should be reviewed.';
    }

    return 'Export available: validation completed with informational notes only.';
  })();

  return (
    <section aria-labelledby="dataset-validation-heading">
      <h2 id="dataset-validation-heading">Dataset Validation</h2>
      <p>
        Manual-first export tools for generating deterministic JSON artifacts for downstream review and auditing.
      </p>
      <h3>Export artifact contents</h3>
      <ul>
        <li>Match metadata</li>
        <li>Video metadata (when available)</li>
        <li>Annotated timeline events</li>
        <li>Annotated position states</li>
        <li>Computed analytics snapshot</li>
      </ul>

      <h3>Export readiness</h3>
      <p>{exportReadinessMessage}</p>
      <p>
        Validation status directly informs readiness. Exporting never changes validation results; it only packages the current
        match dataset as JSON.
      </p>

      <div className="button-row">
        <button type="button" onClick={() => void exportDataset()} disabled={isExportingDataset}>
          {isExportingDataset ? 'Exporting...' : 'Export Dataset JSON'}
        </button>
        <button type="button" onClick={() => void validateDataset()} disabled={isValidatingDataset}>
          {isValidatingDataset ? 'Validating...' : 'Validate Dataset'}
        </button>
      </div>

      {datasetExportError ? <p className="status-error">{datasetExportError}</p> : null}
      {isValidatingDataset ? <p>Validating dataset...</p> : null}
      {datasetValidationError ? <p className="status-error">{datasetValidationError}</p> : null}

      {validationNotRun ? (
        <p>Run validation to inspect dataset integrity before exporting.</p>
      ) : null}

      {!isValidatingDataset && !datasetValidationError && validationReport ? (
        <>
          <DatasetValidationReport validationReport={validationReport} />
        </>
      ) : null}
    </section>
  );
}
