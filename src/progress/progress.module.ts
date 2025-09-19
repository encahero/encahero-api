import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDailyProgress } from './entities/user-daily-progress.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserDailyProgress, User])],
    controllers: [ProgressController],
    providers: [ProgressService],
})
export class ProgressModule {}
