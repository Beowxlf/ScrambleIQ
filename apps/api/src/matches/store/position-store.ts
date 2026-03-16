import type { CreatePositionStateDto, PositionState, UpdatePositionStateDto } from '@scrambleiq/shared';

export interface PositionStore {
  create(matchId: string, input: CreatePositionStateDto): PositionState;
  findPositionsByMatchId(matchId: string): PositionState[];
  findPositionById(id: string): PositionState | undefined;
  update(id: string, input: UpdatePositionStateDto): PositionState | undefined;
  delete(id: string): boolean;
  deleteByMatchId(matchId: string): void;
}
