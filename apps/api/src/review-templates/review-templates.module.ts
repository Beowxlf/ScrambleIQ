import { Module } from '@nestjs/common';
import type { ReviewTemplate } from '@scrambleiq/shared';

import type { PsqlClient } from '../database/database.client';
import { DatabaseModule } from '../database/database.module';
import { DATABASE_CLIENT } from '../database/database.tokens';
import { InMemoryReviewTemplateRepository } from '../repositories/in-memory-review-template.repository';
import { PostgresReviewTemplateRepository } from '../repositories/postgres.repositories';
import { REVIEW_TEMPLATE_REPOSITORY } from '../repositories/review-template.repository';
import { ReviewTemplatesController } from './review-templates.controller';
import { ReviewTemplatesService } from './review-templates.service';

const IN_MEMORY_REVIEW_TEMPLATE_STATE = Symbol('IN_MEMORY_REVIEW_TEMPLATE_STATE');

interface InMemoryReviewTemplateState {
  templates: ReviewTemplate[];
}

@Module({
  imports: [DatabaseModule],
  controllers: [ReviewTemplatesController],
  providers: [
    ReviewTemplatesService,
    {
      provide: IN_MEMORY_REVIEW_TEMPLATE_STATE,
      useFactory: (): InMemoryReviewTemplateState => ({ templates: [] }),
    },
    {
      provide: REVIEW_TEMPLATE_REPOSITORY,
      useFactory: (client: PsqlClient | null, state: InMemoryReviewTemplateState) => (
        client
          ? new PostgresReviewTemplateRepository(client)
          : new InMemoryReviewTemplateRepository(state.templates)
      ),
      inject: [DATABASE_CLIENT, IN_MEMORY_REVIEW_TEMPLATE_STATE],
    },
  ],
})
export class ReviewTemplatesModule {}
