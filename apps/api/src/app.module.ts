import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { ApiTokenGuard } from './auth/api-token.guard';
import { AppController } from './app.controller';
import { MatchesModule } from './matches/matches.module';
import { ReviewTemplatesModule } from './review-templates/review-templates.module';

@Module({
  imports: [MatchesModule, ReviewTemplatesModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiTokenGuard,
    },
  ],
})
export class AppModule {}
