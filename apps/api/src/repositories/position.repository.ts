import type { CreatePositionStateDto, PositionState, UpdatePositionStateDto } from '@scrambleiq/shared';

export interface PositionRepository {
  create(matchId: string, input: CreatePositionStateDto): Promise<PositionState>;
  findByMatchId(matchId: string): Promise<PositionState[]>;
  findById(id: string): Promise<PositionState | undefined>;
  update(id: string, input: UpdatePositionStateDto): Promise<PositionState | undefined>;
  delete(id: string): Promise<boolean>;
}

export const POSITION_REPOSITORY = Symbol('POSITION_REPOSITORY');
