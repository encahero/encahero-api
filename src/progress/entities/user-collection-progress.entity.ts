import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum CollectionStatus {
    ACTIVE = 'active',
    STOPPED = 'stopped',
    COMPLETED = 'completed',
}

@Entity('user_collection_progress')
export class UserCollectionProgress {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    collection_id: number;

    @Column({ default: 0 })
    total_words: number;

    @Column({ default: 0 })
    learned_word_count: number;

    @Column({ default: 0 })
    mastered_word_count: number;

    @Column({ type: 'timestamp', nullable: true })
    last_reviewed_at: Date;

    @Column({ default: 0 })
    current_review_count: number;

    @Column({ default: 0 })
    today_learned_count: number;

    @Column({ type: 'timestamp', nullable: true })
    started_at: Date;

    @Column({ type: 'enum', enum: CollectionStatus, default: CollectionStatus.ACTIVE })
    status: CollectionStatus;

    @Column({ type: 'timestamp', nullable: true })
    stopped_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    completed_at: Date;
}
