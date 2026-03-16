import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { MatchesModule } from './matches/matches.module';

@Module({
  imports: [MatchesModule],
  controllers: [AppController],
})
export class AppModule {}
