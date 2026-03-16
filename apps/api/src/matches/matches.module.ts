import { Module } from '@nestjs/common';

import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { EVENT_STORE } from './store/event-store.token';
import { InMemoryMatchStore } from './store/in-memory-match-store';
import { MATCH_STORE } from './store/match-store.token';

@Module({
  controllers: [MatchesController, EventsController],
  providers: [
    MatchesService,
    EventsService,
    InMemoryMatchStore,
    {
      provide: MATCH_STORE,
      useExisting: InMemoryMatchStore,
    },
    {
      provide: EVENT_STORE,
      useExisting: InMemoryMatchStore,
    },
  ],
})
export class MatchesModule {}
