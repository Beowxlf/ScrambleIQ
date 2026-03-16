import { Inject, Injectable } from '@nestjs/common';

import { CreateMatchDto } from './create-match.dto';
import { Match } from './match.model';
import { MatchStore } from './store/match-store';

@Injectable()
export class MatchesService {
  constructor(@Inject('MATCH_STORE') private readonly matchStore: MatchStore) {}

  create(input: CreateMatchDto): Match {
    return this.matchStore.create(input);
  }

  findAll(): Match[] {
    return this.matchStore.findAll();
  }
}
