import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Match } from '@scrambleiq/shared';

import { CreateMatchDto } from './create-match.dto';
import { UpdateMatchDto } from './update-match.dto';
import { validateCreateMatchPayload, validateUpdateMatchPayload } from './match-validation';
import { MatchStore } from './store/match-store';
import { MATCH_STORE } from './store/match-store.token';

@Injectable()
export class MatchesService {
  constructor(@Inject(MATCH_STORE) private readonly matchStore: MatchStore) {}

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
}
