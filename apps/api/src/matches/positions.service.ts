import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PositionState } from '@scrambleiq/shared';

import { CreatePositionStateDto } from './create-position-state.dto';
import { UpdatePositionStateDto } from './update-position-state.dto';
import { validateCreatePositionStatePayload, validateUpdatePositionStatePayload } from './position-state-validation';
import { MatchStore } from './store/match-store';
import { MATCH_STORE } from './store/match-store.token';
import { PositionStore } from './store/position-store';
import { POSITION_STORE } from './store/position-store.token';

@Injectable()
export class PositionsService {
  constructor(
    @Inject(POSITION_STORE) private readonly positionStore: PositionStore,
    @Inject(MATCH_STORE) private readonly matchStore: MatchStore,
  ) {}

  create(matchId: string, input: CreatePositionStateDto): PositionState {
    const errors = validateCreatePositionStatePayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const match = this.matchStore.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found.`);
    }

    return this.positionStore.create(matchId, input);
  }

  findByMatch(matchId: string): PositionState[] {
    const match = this.matchStore.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found.`);
    }

    return this.positionStore.findPositionsByMatchId(matchId);
  }

  update(id: string, input: UpdatePositionStateDto): PositionState {
    const errors = validateUpdatePositionStatePayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const updated = this.positionStore.update(id, input);

    if (!updated) {
      throw new NotFoundException(`Position state with id ${id} was not found.`);
    }

    return updated;
  }

  delete(id: string): void {
    const isDeleted = this.positionStore.delete(id);

    if (!isDeleted) {
      throw new NotFoundException(`Position state with id ${id} was not found.`);
    }
  }
}
