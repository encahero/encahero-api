import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
const envFile = (() => {
  switch (process.env.APP_MODE) {
    case 'test':
      return '.env.test';
    case 'production':
      return '.env.prod';
    default:
      return '.env.local';
  }
})();

@Module({})
export class CustomConfigModule {
  static register(): DynamicModule {
    const envFilePath = envFile;
    const cache = process.env.CACHE_MODE === 'on';

    return {
      module: CustomConfigModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: [envFilePath],
          cache,
          load: [databaseConfig],
        }),
      ],
    };
  }
}
