import { ArrayMaxSize, ArrayMinSize } from 'class-validator';
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
    BeforeInsert,
    BeforeUpdate,
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
@Unique(['collection', 'en_word', 'vn_word', 'meaning'])
export class Card {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Collection)
    @JoinColumn({ name: 'collection_id' })
    collection: Collection;

    @Column()
    en_word: string;

    @Column()
    phonetic: string;

    @Column('simple-json', { nullable: true })
    @ArrayMinSize(4, { message: 'vn_choice phải có ít nhất 4 phần tử' })
    @ArrayMaxSize(4, { message: 'vn_choice chỉ được có tối đa 4 phần tử' })
    vn_choice: string[];

    @Column()
    vn_word: string;

    @Column('simple-json', { nullable: true })
    @ArrayMinSize(4, { message: 'en_choice phải có ít nhất 4 phần tử' })
    @ArrayMaxSize(4, { message: 'en_choice chỉ được có tối đa 4 phần tử' })
    en_choice: string[];

    @Column()
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

    @BeforeInsert()
    @BeforeUpdate()
    ensureVnChoiceContainsCorrect() {
        if (!Array.isArray(this.vn_choice)) {
            this.vn_choice = [];
        }

        let wrongs = this.vn_choice.filter((c) => c !== this.vn_word);

        if (wrongs.length > 3) {
            wrongs = wrongs.slice(0, 3);
        }

        this.vn_choice = [this.vn_word, ...wrongs];
    }

    @BeforeInsert()
    @BeforeUpdate()
    ensureEnChoiceContainsCorrect() {
        if (!Array.isArray(this.en_choice)) {
            this.en_choice = [];
        }

        let wrongs = this.en_choice.filter((c) => c !== this.en_word);

        if (wrongs.length > 3) {
            wrongs = wrongs.slice(0, 3);
        }

        this.en_choice = [this.en_word, ...wrongs];
    }
}
