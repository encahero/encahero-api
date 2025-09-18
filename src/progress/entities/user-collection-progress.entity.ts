import { Collection } from 'src/collections/entities/collection.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum CollectionStatus {
    IN_PROGRESS = 'in_progress',
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

    @ManyToOne(() => Collection, (collection) => collection.userProgress, { eager: true })
    @JoinColumn({ name: 'collection_id' })
    collection: Collection;

    // calculate
    total_words: number;

    @Column({ default: 20 })
    task_count: number;

    @Column({ type: 'timestamp', nullable: true })
    last_reviewed_at: Date;

    @Column({ default: 0 })
    current_review_count: number;

    @Column({ default: 0 })
    today_learned_count: number;

    @Column({ type: 'timestamp', nullable: true })
    started_at: Date;

    @Column({ type: 'enum', enum: CollectionStatus, default: CollectionStatus.IN_PROGRESS })
    status: CollectionStatus;

    @Column({ type: 'timestamp', nullable: true })
    stopped_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    completed_at: Date;
}
