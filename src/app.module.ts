import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { CollectionsModule } from './collections/collections.module';
import { CardsModule } from './cards/cards.module';
import { BattleModule } from './battle/battle.module';
import { AuthModule } from './auth/auth.module';

import { DatabaseModule } from './database/database.module';
import { CacheRedisModule } from './redis/redis.module';
import { CustomConfigModule } from './config/custom-config.module';
import { LoggerMiddleware } from './common/middleware/logger.middle';
import { ProgressModule } from './progress/progress.module';
import { QuizModule } from './quiz/quiz.module';

@Module({
    imports: [
        CustomConfigModule.register(),
        DatabaseModule,
        CacheRedisModule,
        UsersModule,
        CategoriesModule,
        CollectionsModule,
        CardsModule,
        BattleModule,
        AuthModule,
        ProgressModule,
        QuizModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*'); // Áp dụng cho tất cả route
    }
}
