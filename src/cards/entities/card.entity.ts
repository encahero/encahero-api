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
    NOUN = 'noun', // danh từ
    VERB = 'verb', // động từ
    ADJECTIVE = 'adjective', // tính từ
    ADVERB = 'adverb', // trạng từ
    PRONOUN = 'pronoun', // đại từ
    PREPOSITION = 'preposition', // giới từ
    CONJUNCTION = 'conjunction', // liên từ
    INTERJECTION = 'interjection', // thán từ
    PHRASE = 'phrase', // cụm từ
    IDIOM = 'idiom', // thành ngữ
    OTHER = 'other', // loại khác
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

    @Column('simple-json', { nullable: true })
    vn_wrongs: string[];

    @Column()
    vn_correct: string;

    @Column('simple-json', { nullable: true })
    en_wrongs: string[];

    @Column()
    en_correct: string;

    @Column({ nullable: true })
    meaning: string;

    @Column('simple-json', { nullable: true })
    ex: string[];

    @Column({ nullable: true })
    image_url: string;

    @Column({ type: 'enum', enum: CardType, default: CardType.OTHER })
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
