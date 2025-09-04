import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';

import { GlobalValidationPipe } from './common/pipes/validator.pipe';

async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync(path.join(__dirname, '..', 'secrets', 'private-key.pem')),
  //   cert: fs.readFileSync(path.join(__dirname, '..', 'secrets', 'public-certificate.pem')),
  // }
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors(
    {
       origin: [
      'exp://192.168.1.100:8081',
      'http://192.168.1.100:19006', 
    ],
      credentials: true,
    }
  );
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(GlobalValidationPipe);  
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
