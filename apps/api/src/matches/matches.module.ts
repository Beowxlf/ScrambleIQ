import { Module } from '@nestjs/common';

import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { InMemoryMatchStore } from './store/in-memory-match-store';
import { MATCH_STORE } from './store/match-store.token';

@Module({
  controllers: [MatchesController],
  providers: [
    MatchesService,
    InMemoryMatchStore,
    {
      provide: MATCH_STORE,
      useExisting: InMemoryMatchStore,
    },
  ],
})
export class MatchesModule {}
