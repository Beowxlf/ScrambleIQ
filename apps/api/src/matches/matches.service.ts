import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Match } from '@scrambleiq/shared';

import { CreateMatchDto } from './create-match.dto';
import { UpdateMatchDto } from './update-match.dto';
import { validateCreateMatchPayload, validateUpdateMatchPayload } from './match-validation';
import { EventStore } from './store/event-store';
import { EVENT_STORE } from './store/event-store.token';
import { MatchStore } from './store/match-store';
import { MATCH_STORE } from './store/match-store.token';
import { PositionStore } from './store/position-store';
import { POSITION_STORE } from './store/position-store.token';

@Injectable()
export class MatchesService {
  constructor(
    @Inject(MATCH_STORE) private readonly matchStore: MatchStore,
    @Inject(EVENT_STORE) private readonly eventStore: EventStore,
    @Inject(POSITION_STORE) private readonly positionStore: PositionStore,
  ) {}

  create(input: CreateMatchDto): Match {
    const errors = validateCreateMatchPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.matchStore.create(input);
  }

  findAll(): Match[] {
    return this.matchStore.findAll();
  }

  update(id: string, input: UpdateMatchDto): Match {
    const errors = validateUpdateMatchPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestException(['At least one field must be provided for update']);
    }

    const updatedMatch = this.matchStore.update(id, input);

    if (!updatedMatch) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }

    return updatedMatch;
  }

  findOne(id: string): Match {
    const match = this.matchStore.findById(id);

    if (!match) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }

    return match;
  }

  delete(id: string): void {
    const isDeleted = this.matchStore.delete(id);

    if (!isDeleted) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }

    this.eventStore.deleteByMatchId(id);
    this.positionStore.deleteByMatchId(id);
  }
}
