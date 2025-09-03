import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '..', 'secrets', 'private-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '..', 'secrets', 'public-certificate.pem')),
  }
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
