import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum CardStatus {
    ACTIVE = 'active',
    MASTERED = 'mastered',
}

export enum CardRating {
    E = 'E', // Easy
    M = 'M', // Medium
    H = 'H', // Hard
}

@Entity('user_card_progress')
export class UserCardProgress {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    collection_id: number;

    @Column()
    card_id: number;

    @Column({ default: 0 })
    learned_count: number;

    @Column({ type: 'enum', enum: CardStatus, default: CardStatus.ACTIVE })
    status: CardStatus;

    @Column({ type: 'enum', enum: CardRating, nullable: true })
    rating: CardRating;
}
