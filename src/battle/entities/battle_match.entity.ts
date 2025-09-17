import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum BattleMode {
    ALL = 'all',
    LIST = 'list',
}

@Entity('battle_match')
export class BattleMatch {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    list_id: number;

    @Column({ type: 'enum', enum: BattleMode, default: BattleMode.ALL })
    mode: BattleMode;

    @Column()
    total_question: number;

    @Column({ type: 'timestamp' })
    started_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    finished_at: Date;

    @Column({ nullable: true })
    winner_id: number;
}
