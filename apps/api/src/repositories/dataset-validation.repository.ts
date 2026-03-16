import type { DatasetValidationReport } from '@scrambleiq/shared';

export interface DatasetValidationRepository {
  upsert(matchId: string, report: DatasetValidationReport): Promise<void>;
}

export const DATASET_VALIDATION_REPOSITORY = Symbol('DATASET_VALIDATION_REPOSITORY');
