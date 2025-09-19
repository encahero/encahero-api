import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('user_daily_progress')
export class UserDailyProgress {
    @PrimaryColumn()
    user_id: number;

    @PrimaryColumn({ type: 'date' })
    date: string;

    @Column({ default: 0 })
    card_answered: number;
}
