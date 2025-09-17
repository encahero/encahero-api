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

@Entity('collections')
export class Collection {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToOne(() => Category, (category) => category.collections, { eager: true })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @OneToMany(() => Card, (card) => card.collection)
    cards: Card[];

    @Column({ default: 0 })
    register_count: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
