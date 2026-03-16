import type { DatasetValidationIssue, DatasetValidationReport as DatasetValidationReportModel } from '@scrambleiq/shared';

interface DatasetValidationReportProps {
  validationReport: DatasetValidationReportModel;
}

export function DatasetValidationReport({ validationReport }: DatasetValidationReportProps) {
  return (
    <>
      <p>Validation status: {validationReport.isValid ? 'Valid' : 'Invalid'}</p>
      <p>Total issues: {validationReport.issueCount}</p>

      {validationReport.issues.length === 0 ? <p>No issues found. Dataset is ready for export.</p> : null}

      {(['ERROR', 'WARNING', 'INFO'] as const).map((severity) => {
        const issuesForSeverity = validationReport.issues.filter((issue) => issue.severity === severity);

        if (issuesForSeverity.length === 0) {
          return null;
        }

        return (
          <div key={severity}>
            <h3>{severity}</h3>
            <ul>
              {issuesForSeverity.map((issue: DatasetValidationIssue, index: number) => (
                <li key={`${severity}-${issue.type}-${index}`}>
                  <strong>{issue.type}</strong>: {issue.message}
                  {issue.context ? <pre>{JSON.stringify(issue.context, null, 2)}</pre> : null}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
}
