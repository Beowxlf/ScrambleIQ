import type { DatasetValidationIssue, DatasetValidationReport as DatasetValidationReportModel } from '@scrambleiq/shared';

interface DatasetValidationReportProps {
  validationReport: DatasetValidationReportModel;
}

const severityDetails = {
  ERROR: { label: 'Blocking issues', guidance: 'Fix before export.', symbol: '⛔' },
  WARNING: { label: 'Warnings', guidance: 'Review before export.', symbol: '⚠️' },
  INFO: { label: 'Informational notes', guidance: 'Optional follow-up.', symbol: 'ℹ️' },
} as const;

export function DatasetValidationReport({ validationReport }: DatasetValidationReportProps) {
  const severityCounts = {
    ERROR: validationReport.issues.filter((issue) => issue.severity === 'ERROR').length,
    WARNING: validationReport.issues.filter((issue) => issue.severity === 'WARNING').length,
    INFO: validationReport.issues.filter((issue) => issue.severity === 'INFO').length,
  };

  return (
    <>
      <h3>Validation report</h3>
      <ul>
        <li>
          <strong>Validation status:</strong> {validationReport.isValid ? 'Valid' : 'Invalid'}
        </li>
        <li>
          <strong>Total issues:</strong> {validationReport.issueCount}
        </li>
        <li>
          <strong>Blocking issues:</strong> {severityCounts.ERROR}
        </li>
        <li>
          <strong>Warnings:</strong> {severityCounts.WARNING}
        </li>
        <li>
          <strong>Informational notes:</strong> {severityCounts.INFO}
        </li>
      </ul>

      {validationReport.issues.length === 0 ? <p>No issues found. Dataset is ready for export.</p> : null}

      {(['ERROR', 'WARNING', 'INFO'] as const).map((severity) => {
        const issuesForSeverity = validationReport.issues.filter((issue) => issue.severity === severity);

        if (issuesForSeverity.length === 0) {
          return null;
        }

        const details = severityDetails[severity];

        return (
          <section key={severity} aria-labelledby={`validation-severity-${severity}`}>
            <h4 id={`validation-severity-${severity}`}>
              {details.symbol} {details.label} ({severity})
            </h4>
            <p>{details.guidance}</p>
            <ul>
              {issuesForSeverity.map((issue: DatasetValidationIssue, index: number) => (
                <li key={`${severity}-${issue.type}-${index}`}>
                  <strong>{issue.type}</strong>: {issue.message}
                  {issue.context ? <pre>{JSON.stringify(issue.context, null, 2)}</pre> : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
