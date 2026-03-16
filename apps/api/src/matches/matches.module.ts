import { Module } from '@nestjs/common';
import type { Match, MatchVideo, PositionState, TimelineEvent } from '@scrambleiq/shared';

import type { PsqlClient } from '../database/database.client';
import { DATABASE_CLIENT } from '../database/database.tokens';
import { DatabaseModule } from '../database/database.module';
import { DATASET_VALIDATION_REPOSITORY } from '../repositories/dataset-validation.repository';
import { EVENT_REPOSITORY } from '../repositories/event.repository';
import {
  InMemoryDatasetValidationRepository,
  InMemoryEventRepository,
  InMemoryMatchRepository,
  InMemoryPositionRepository,
  InMemoryVideoRepository,
} from '../repositories/in-memory.repositories';
import { MATCH_REPOSITORY } from '../repositories/match.repository';
import { POSITION_REPOSITORY } from '../repositories/position.repository';
import {
  PostgresDatasetValidationRepository,
  PostgresEventRepository,
  PostgresMatchRepository,
  PostgresPositionRepository,
  PostgresVideoRepository,
} from '../repositories/postgres.repositories';
import { VIDEO_REPOSITORY } from '../repositories/video.repository';
import { DatasetValidationService } from './dataset-validation.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';

const IN_MEMORY_STATE = Symbol('IN_MEMORY_STATE');

interface InMemoryState {
  matches: Match[];
  events: TimelineEvent[];
  positions: PositionState[];
  videos: MatchVideo[];
}

@Module({
  imports: [DatabaseModule],
  controllers: [MatchesController, EventsController, PositionsController, VideosController],
  providers: [
    DatasetValidationService,
    MatchesService,
    EventsService,
    PositionsService,
    VideosService,
    {
      provide: IN_MEMORY_STATE,
      useFactory: (): InMemoryState => ({ matches: [], events: [], positions: [], videos: [] }),
    },
    {
      provide: MATCH_REPOSITORY,
      useFactory: (client: PsqlClient | null, state: InMemoryState) => (client ? new PostgresMatchRepository(client) : new InMemoryMatchRepository(state.matches)),
      inject: [DATABASE_CLIENT, IN_MEMORY_STATE],
    },
    {
      provide: EVENT_REPOSITORY,
      useFactory: (client: PsqlClient | null, state: InMemoryState) => (client ? new PostgresEventRepository(client) : new InMemoryEventRepository(state.events)),
      inject: [DATABASE_CLIENT, IN_MEMORY_STATE],
    },
    {
      provide: POSITION_REPOSITORY,
      useFactory: (client: PsqlClient | null, state: InMemoryState) => (client ? new PostgresPositionRepository(client) : new InMemoryPositionRepository(state.positions)),
      inject: [DATABASE_CLIENT, IN_MEMORY_STATE],
    },
    {
      provide: VIDEO_REPOSITORY,
      useFactory: (client: PsqlClient | null, state: InMemoryState) => (client ? new PostgresVideoRepository(client) : new InMemoryVideoRepository(state.videos)),
      inject: [DATABASE_CLIENT, IN_MEMORY_STATE],
    },
    {
      provide: DATASET_VALIDATION_REPOSITORY,
      useFactory: (client: PsqlClient | null) => (client ? new PostgresDatasetValidationRepository(client) : new InMemoryDatasetValidationRepository()),
      inject: [DATABASE_CLIENT],
    },
  ],
})
export class MatchesModule {}
