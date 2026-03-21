import { Module } from '@nestjs/common';
import type { ReviewTemplate } from '@scrambleiq/shared';

import { InMemoryReviewTemplateRepository } from '../repositories/in-memory-review-template.repository';
import { REVIEW_TEMPLATE_REPOSITORY } from '../repositories/review-template.repository';
import { ReviewTemplatesController } from './review-templates.controller';
import { ReviewTemplatesService } from './review-templates.service';

const IN_MEMORY_REVIEW_TEMPLATE_STATE = Symbol('IN_MEMORY_REVIEW_TEMPLATE_STATE');

interface InMemoryReviewTemplateState {
  templates: ReviewTemplate[];
}

@Module({
  controllers: [ReviewTemplatesController],
  providers: [
    ReviewTemplatesService,
    {
      provide: IN_MEMORY_REVIEW_TEMPLATE_STATE,
      useFactory: (): InMemoryReviewTemplateState => ({ templates: [] }),
    },
    {
      provide: REVIEW_TEMPLATE_REPOSITORY,
      useFactory: (state: InMemoryReviewTemplateState) => new InMemoryReviewTemplateRepository(state.templates),
      inject: [IN_MEMORY_REVIEW_TEMPLATE_STATE],
    },
  ],
})
export class ReviewTemplatesModule {}
