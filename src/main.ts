import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as express from 'express';
import { GlobalValidationPipe } from './common/pipes/validator.pipe';
import { CustomExceptionsFilter } from './common/filter/custom-exception.filter';
import path from 'path';

async function bootstrap() {
    // const httpsOptions = {
    //   key: fs.readFileSync(path.join(__dirname, '..', 'secrets', 'private-key.pem')),
    //   cert: fs.readFileSync(path.join(__dirname, '..', 'secrets', 'public-certificate.pem')),
    // }
    const app = await NestFactory.create(AppModule);
    app.use(helmet());
    app.enableCors({
        origin: '*',
        // credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(GlobalValidationPipe);
    app.useGlobalFilters(new CustomExceptionsFilter());
    app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
