import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('battle_player')
export class BattlePlayer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    match_id: number;

    @Column()
    user_id: number;

    @Column({ default: 0 })
    correct_count: number;

    @Column({ default: 0 })
    score: number;

    @Column({ default: false })
    is_winner: boolean;
}
