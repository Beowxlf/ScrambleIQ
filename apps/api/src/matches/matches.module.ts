import { Module } from '@nestjs/common';

import { DatasetValidationService } from './dataset-validation.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { EVENT_STORE } from './store/event-store.token';
import { InMemoryMatchStore } from './store/in-memory-match-store';
import { MATCH_STORE } from './store/match-store.token';
import { POSITION_STORE } from './store/position-store.token';
import { VIDEO_STORE } from './store/video-store.token';

@Module({
  controllers: [MatchesController, EventsController, PositionsController, VideosController],
  providers: [
    DatasetValidationService,
    MatchesService,
    EventsService,
    PositionsService,
    VideosService,
    InMemoryMatchStore,
    {
      provide: MATCH_STORE,
      useExisting: InMemoryMatchStore,
    },
    {
      provide: EVENT_STORE,
      useExisting: InMemoryMatchStore,
    },
    {
      provide: POSITION_STORE,
      useExisting: InMemoryMatchStore,
    },
    {
      provide: VIDEO_STORE,
      useExisting: InMemoryMatchStore,
    },
  ],
})
export class MatchesModule {}
