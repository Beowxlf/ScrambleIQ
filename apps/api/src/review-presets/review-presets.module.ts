import { Module } from '@nestjs/common';
import type { SavedReviewPreset } from '@scrambleiq/shared';

import type { PsqlClient } from '../database/database.client';
import { DatabaseModule } from '../database/database.module';
import { DATABASE_CLIENT } from '../database/database.tokens';
import { InMemoryReviewPresetRepository } from '../repositories/in-memory-review-preset.repository';
import { PostgresReviewPresetRepository } from '../repositories/postgres.repositories';
import { REVIEW_PRESET_REPOSITORY } from '../repositories/review-preset.repository';
import { ReviewPresetsController } from './review-presets.controller';
import { ReviewPresetsService } from './review-presets.service';

const IN_MEMORY_REVIEW_PRESET_STATE = Symbol('IN_MEMORY_REVIEW_PRESET_STATE');

interface InMemoryReviewPresetState {
  presets: SavedReviewPreset[];
}

@Module({
  imports: [DatabaseModule],
  controllers: [ReviewPresetsController],
  providers: [
    ReviewPresetsService,
    {
      provide: IN_MEMORY_REVIEW_PRESET_STATE,
      useFactory: (): InMemoryReviewPresetState => ({ presets: [] }),
    },
    {
      provide: REVIEW_PRESET_REPOSITORY,
      useFactory: (client: PsqlClient | null, state: InMemoryReviewPresetState) => (
        client
          ? new PostgresReviewPresetRepository(client)
          : new InMemoryReviewPresetRepository(state.presets)
      ),
      inject: [DATABASE_CLIENT, IN_MEMORY_REVIEW_PRESET_STATE],
    },
  ],
})
export class ReviewPresetsModule {}
