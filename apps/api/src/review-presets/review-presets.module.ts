import { Module } from '@nestjs/common';
import type { SavedReviewPreset } from '@scrambleiq/shared';

import { InMemoryReviewPresetRepository } from '../repositories/in-memory-review-preset.repository';
import { REVIEW_PRESET_REPOSITORY } from '../repositories/review-preset.repository';
import { ReviewPresetsController } from './review-presets.controller';
import { ReviewPresetsService } from './review-presets.service';

const IN_MEMORY_REVIEW_PRESET_STATE = Symbol('IN_MEMORY_REVIEW_PRESET_STATE');

interface InMemoryReviewPresetState {
  presets: SavedReviewPreset[];
}

@Module({
  controllers: [ReviewPresetsController],
  providers: [
    ReviewPresetsService,
    {
      provide: IN_MEMORY_REVIEW_PRESET_STATE,
      useFactory: (): InMemoryReviewPresetState => ({ presets: [] }),
    },
    {
      provide: REVIEW_PRESET_REPOSITORY,
      useFactory: (state: InMemoryReviewPresetState) => new InMemoryReviewPresetRepository(state.presets),
      inject: [IN_MEMORY_REVIEW_PRESET_STATE],
    },
  ],
})
export class ReviewPresetsModule {}
