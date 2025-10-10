import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { User } from 'src/common/decarators/user.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';

@Controller('progress')
export class ProgressController {
    constructor(private readonly progressService: ProgressService) {}

    @UseGuards(AuthGuard)
    @Get('stats/daily-and-weekly')
    async getStasDailyAndWeekly(@User('id') userId: number, @User('time_zone') timeZone: string) {
        const data = await this.progressService.getStasDailyAndWeekly(userId, timeZone);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.PROGRESS.STATS_DAILY_AND_WEEKLY, data);
    }

    @UseGuards(AuthGuard)
    @Get('contribution')
    async getContribution(@User('id') userId: number, @User('time_zone') timeZone: string) {
        const data: any = await this.progressService.getContribution(userId, timeZone);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.PROGRESS.STATS_DAILY_AND_WEEKLY, data);
    }
}
