import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Card } from 'src/cards/entities/card.entity';
import { UserCollectionProgress } from 'src/progress/entities/user-collection-progress.entity';

@Entity('collections')
export class Collection {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ type: 'text', nullable: true, default: null })
    icon: string | null;

    @ManyToOne(() => Category, (category) => category.collections, { eager: true })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @OneToMany(() => Card, (card) => card.collection)
    cards: Card[];

    @OneToMany(() => UserCollectionProgress, (progress) => progress.collection)
    userProgress: UserCollectionProgress[];

    @Column({ default: 0 })
    register_count: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
