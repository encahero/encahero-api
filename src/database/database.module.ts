import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { CustomConfigModule } from 'src/config/custom-config.module';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        CustomConfigModule.register(),
        TypeOrmModule.forRootAsync({
            imports: [CustomConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const dbConfig = configService.get('database') as TypeOrmModuleOptions;
                if (!dbConfig) {
                    throw new Error('Database config not found');
                } else {
                    console.log('Database config loaded:', dbConfig);
                }
                return dbConfig;
            },
        }),
    ],
    providers: [DatabaseService],
})
export class DatabaseModule {}
