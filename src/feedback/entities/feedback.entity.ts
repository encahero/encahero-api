import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Feedback {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @Column()
    user_id: number;

    @Column({ type: 'simple-array', nullable: true })
    images: string[];

    @CreateDateColumn()
    createdAt: Date;
}
