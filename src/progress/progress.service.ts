import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDailyProgress } from './entities/user-daily-progress.entity';
import { Repository } from 'typeorm';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import dayjs from 'src/config/dayjs.config';
interface WeekProgress {
    total: string | null;
}

@Injectable()
export class ProgressService {
    constructor(
        @InjectRepository(UserDailyProgress) private readonly userDailyProgressRepo: Repository<UserDailyProgress>,
    ) {}

    async getStasDailyAndWeekly(userId: number, timeZone) {
        const now = new Date();
        const startOfDay = dayjs(now).tz(timeZone).startOf('day').toDate();

        // Get today learned cards
        const todayProgress = await this.userDailyProgressRepo.findOne({
            where: { user_id: userId, date: startOfDay },
        });

        const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

        const weekProgress: WeekProgress | undefined = await this.userDailyProgressRepo
            .createQueryBuilder('udp')
            .select('SUM(udp.card_answered)', 'total')
            .where('udp.user_id = :userId', { userId })
            .andWhere('udp.date BETWEEN :start AND :end', {
                start: format(weekStart, 'yyyy-MM-dd'),
                end: format(weekEnd, 'yyyy-MM-dd'),
            })
            .getRawOne();

        const today = todayProgress?.card_answered || 0;
        const week = parseInt(weekProgress?.total || '0', 10);

        return { today, week };
    }
}
