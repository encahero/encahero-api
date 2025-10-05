import { Entity, Column, Unique, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_daily_progress')
@Unique(['user_id', 'date'])
export class UserDailyProgress {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ default: 0 })
    card_answered: number;
}
