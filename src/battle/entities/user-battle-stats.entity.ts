import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user_battle_stats')
export class UserBattleStats {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 })
    total_battles: number;

    @Column({ default: 0 })
    total_win: number;

    @Column({ default: 0 })
    total_loses: number;

    @Column({ default: 0 })
    total_score: number;

    @Column({ default: 0 })
    highest_score: number;
}
