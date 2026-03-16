import { Injectable } from '@nestjs/common';
import type { CreateMatchDto, Match, UpdateMatchDto } from '@scrambleiq/shared';

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

  update(id: string, input: UpdateMatchDto): Match | undefined {
    const index = this.matches.findIndex((match) => match.id === id);

    if (index < 0) {
      return undefined;
    }

    const current = this.matches[index];
    const updated: Match = {
      ...current,
      ...input,
      notes: input.notes ?? current.notes,
    };

    this.matches[index] = updated;
    return updated;
  }

  delete(id: string): boolean {
    const index = this.matches.findIndex((match) => match.id === id);

    if (index < 0) {
      return false;
    }

    this.matches.splice(index, 1);
    return true;
  }
}
