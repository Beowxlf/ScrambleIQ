import { Injectable } from '@nestjs/common';
import type { CreateMatchDto, Match } from '@scrambleiq/shared';

import { MatchStore } from './match-store';

@Injectable()
export class InMemoryMatchStore implements MatchStore {
  private readonly matches: Match[] = [];

  create(input: CreateMatchDto): Match {
    const match: Match = {
      id: crypto.randomUUID(),
      title: input.title,
      date: input.date,
      ruleset: input.ruleset,
      competitorA: input.competitorA,
      competitorB: input.competitorB,
      notes: input.notes ?? '',
    };

    this.matches.push(match);
    return match;
  }

  findAll(): Match[] {
    return [...this.matches].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  }

  findById(id: string): Match | undefined {
    return this.matches.find((match) => match.id === id);
  }
}
