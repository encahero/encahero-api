import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ unique: true, nullable: false })
    username: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ nullable: true })
    password: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ nullable: true, default: 'UTC' })
    time_zone: string;

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            const saltRounds = 10;
            this.password = await bcrypt.hash(this.password, saltRounds);
        }
    }

    @BeforeInsert()
    generateUserName() {
        if (!this.username && this.email) {
            // Lấy phần trước @ của email
            const namePart = this.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');

            // Thêm 4 chữ số random
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            this.username = `${namePart}${randomSuffix}`.toLowerCase();
        }
    }
}
