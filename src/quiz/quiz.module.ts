import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Card } from 'src/cards/entities/card.entity';
import { UserCardProgress } from 'src/progress/entities/user-card-progress.entity';
import { UserCollectionProgress } from 'src/progress/entities/user-collection-progress.entity';
import { UserDailyProgress } from 'src/progress/entities/user-daily-progress.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Card, UserCardProgress, UserCollectionProgress, UserDailyProgress])],
    controllers: [QuizController],
    providers: [QuizService],
})
export class QuizModule {}
