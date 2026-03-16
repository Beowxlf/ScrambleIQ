import { Module } from '@nestjs/common';

import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { InMemoryMatchStore } from './store/in-memory-match-store';

@Module({
  controllers: [MatchesController],
  providers: [
    MatchesService,
    InMemoryMatchStore,
    {
      provide: 'MATCH_STORE',
      useExisting: InMemoryMatchStore,
    },
  ],
})
export class MatchesModule {}
