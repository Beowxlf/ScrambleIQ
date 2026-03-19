import { useEffect, useState } from 'react';

import type { DatasetValidationReport, MatchDatasetExport } from '@scrambleiq/shared';

import type { MatchesApi } from '../../matches-api';

function downloadDatasetAsJson(dataset: MatchDatasetExport, matchId: string): void {
  const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `match-${matchId}-dataset.json`;
  link.click();
  URL.revokeObjectURL(href);
}

interface UseMatchDatasetToolsArgs {
  api: MatchesApi;
  matchId: string;
  refreshTrigger: number;
}

export function useMatchDatasetTools({ api, matchId, refreshTrigger }: UseMatchDatasetToolsArgs) {
  const [isExportingDataset, setIsExportingDataset] = useState(false);
  const [datasetExportError, setDatasetExportError] = useState<string | null>(null);
  const [validationReport, setValidationReport] = useState<DatasetValidationReport | null>(null);
  const [isValidatingDataset, setIsValidatingDataset] = useState(false);
  const [datasetValidationError, setDatasetValidationError] = useState<string | null>(null);

  useEffect(() => {
    setValidationReport(null);
    setDatasetValidationError(null);
    setDatasetExportError(null);
  }, [matchId, refreshTrigger]);

  const exportDataset = async () => {
    setIsExportingDataset(true);
    setDatasetExportError(null);

    try {
      const dataset = await api.exportMatchDataset(matchId);
      downloadDatasetAsJson(dataset, matchId);
    } catch {
      setDatasetExportError('Unable to export dataset right now. Please try again.');
    } finally {
      setIsExportingDataset(false);
    }
  };

  const validateDataset = async () => {
    setIsValidatingDataset(true);
    setDatasetValidationError(null);

    try {
      const report = await api.validateMatchDataset(matchId);
      setValidationReport(report);
    } catch {
      setDatasetValidationError('Unable to validate dataset right now. Please try again.');
    } finally {
      setIsValidatingDataset(false);
    }
  };

  return {
    datasetExportError,
    datasetValidationError,
    exportDataset,
    isExportingDataset,
    isValidatingDataset,
    validateDataset,
    validationReport,
  };
}
