import { Collection } from 'src/collections/entities/collection.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';

export enum CardType {
    VOCAB = 'vocab',
    PHRASE = 'phrase',
    IDIOM = 'idiom',
    OTHER = 'other',
}

@Entity('cards')
@Unique(['collection', 'main_word', 'meaning'])
export class Card {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Collection)
    @JoinColumn({ name: 'collection_id' })
    collection: Collection;

    @Column()
    main_word: string;

    @Column('simple-array', { nullable: true })
    vn_wrongs: string[];

    @Column()
    vn_correct: string;

    @Column('simple-array', { nullable: true })
    en_wrongs: string[];

    @Column()
    en_correct: string;

    @Column({ nullable: true })
    meaning: string;

    @Column('simple-array', { nullable: true })
    ex: string[];

    @Column({ nullable: true })
    image_url: string;

    @Column({ type: 'enum', enum: CardType, default: CardType.VOCAB })
    type: CardType;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;
}
