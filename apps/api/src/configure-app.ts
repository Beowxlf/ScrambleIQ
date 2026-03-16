import { INestApplication } from '@nestjs/common';

import { GlobalValidationPipe } from './common/pipes/global-validation.pipe';

export function configureApp(app: INestApplication): void {
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  });

  app.useGlobalPipes(new GlobalValidationPipe());
}
