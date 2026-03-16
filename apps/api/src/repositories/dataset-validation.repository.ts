import type { DatasetValidationReport } from '@scrambleiq/shared';

export interface DatasetValidationRepository {
  upsert(matchId: string, report: DatasetValidationReport): Promise<void>;
  findByMatchId(matchId: string): Promise<DatasetValidationReport | undefined>;
}

export const DATASET_VALIDATION_REPOSITORY = Symbol('DATASET_VALIDATION_REPOSITORY');
