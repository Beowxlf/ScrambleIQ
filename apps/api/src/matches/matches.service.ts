import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Match } from '@scrambleiq/shared';

import { CreateMatchDto } from './create-match.dto';
import { MatchStore } from './store/match-store';
import { MATCH_STORE } from './store/match-store.token';

@Injectable()
export class MatchesService {
  constructor(@Inject(MATCH_STORE) private readonly matchStore: MatchStore) {}

  create(input: CreateMatchDto): Match {
    return this.matchStore.create(input);
  }

  findAll(): Match[] {
    return this.matchStore.findAll();
  }

  findOne(id: string): Match {
    const match = this.matchStore.findById(id);

    if (!match) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }

    return match;
  }
}
