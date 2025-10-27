import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDailyProgress } from './entities/user-daily-progress.entity';
import { Repository } from 'typeorm';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import dayjs from 'src/config/dayjs.config';
import { UserCollectionProgress } from './entities/user-collection-progress.entity';
interface WeekProgress {
    total: string | null;
}

interface ContributionDto {
    date: string;
    count: number;
}

@Injectable()
export class ProgressService {
    private readonly logger = new Logger(ProgressService.name);

    constructor(
        @InjectRepository(UserDailyProgress) private readonly userDailyProgressRepo: Repository<UserDailyProgress>,
        @InjectRepository(UserDailyProgress)
        private readonly userCollectionProgressRepo: Repository<UserCollectionProgress>,
    ) {}

    async getStasDailyAndWeekly(userId: number, timeZone: string) {
        const now = dayjs().tz(timeZone);
        // Start of day UTC
        const startOfDayUTC = now.startOf('day').utc().toDate();

        // Get today learned cards
        const todayProgress = await this.userDailyProgressRepo.findOne({
            where: { user_id: userId, date: startOfDayUTC },
        });

        // Week range UTC
        const weekStartLocal = startOfWeek(now.toDate(), { weekStartsOn: 1 }); // Monday
        const weekEndLocal = endOfWeek(now.toDate(), { weekStartsOn: 1 }); // Sunday
        const weekStartUTC = dayjs(weekStartLocal).tz(timeZone).startOf('day').utc().toDate();
        const weekEndUTC = dayjs(weekEndLocal).tz(timeZone).endOf('day').utc().toDate();

        const weekProgress: WeekProgress | undefined = await this.userDailyProgressRepo
            .createQueryBuilder('udp')
            .select('SUM(udp.card_answered)', 'total')
            .where('udp.user_id = :userId', { userId })
            .andWhere('udp.date BETWEEN :start AND :end', {
                start: format(weekStartUTC, 'yyyy-MM-dd'),
                end: format(weekEndUTC, 'yyyy-MM-dd'),
            })
            .getRawOne();

        const today = todayProgress?.card_answered || 0;
        const week = parseInt(weekProgress?.total || '0', 10);

        return { today, week };
    }

    async getContribution(userId: number, timeZone: string) {
        const contribution = await this.userDailyProgressRepo.find({
            where: { user_id: userId },
        });

        // Convert date về timezone của người dùng
        let converted: ContributionDto[] = [];
        if (contribution.length > 0) {
            converted = contribution.map((item) => ({
                date: dayjs.utc(item.date).tz(timeZone).format('YYYY-MM-DD'),
                count: item.card_answered,
            }));
        }

        return converted;
    }
}
