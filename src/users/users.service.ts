import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import { ERROR_MESSAGES } from 'src/constants';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { FOLDER_AVATAR, FOLDER_UPLOAD } from 'src/constants/upload-folder-name';

type UserGrowth = {
    date: string; // hoặc Date nếu bạn muốn convert
    count: number;
};

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

    create(createUserDto: CreateUserDto) {
        const user = this.userRepo.create(createUserDto);
        return this.userRepo.save(user);
    }

    async updateTimeZone(userId: number, timeZone: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
        user.time_zone = timeZone;
        const newUser = await this.userRepo.save(user);
        const safeUser = plainToInstance(UserResponseDto, newUser, { excludeExtraneousValues: true });

        return safeUser;
    }

    async findByEmail(email: string) {
        return this.userRepo.findOne({ where: { email } });
    }

    async findById(id: number) {
        return this.userRepo.findOne({ where: { id } });
    }

    async findAll() {
        const data = await this.userRepo.find({
            select: [
                'id',
                'email',
                'username',
                'avatar',
                'firstName',
                'lastName',
                'created_at',
                'updated_at',
                'time_zone',
            ],
            order: {
                created_at: 'DESC', // hoặc 'ASC' nếu muốn từ cũ tới mới
            },
        });
        return data;
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    async update(id: number, userId: number, file: Express.Multer.File, updateUserDto: UpdateUserDto) {
        if (id !== userId) {
            throw new ForbiddenException('You are not allowed to update another user');
        }

        const user = await this.userRepo.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const filteredDto = Object.fromEntries(
            Object.entries(updateUserDto).filter(([, v]) => v !== undefined && v !== null),
        );

        if (file) {
            filteredDto['avatar'] = `/${FOLDER_UPLOAD}/${FOLDER_AVATAR}/${file.filename}`;
        }

        Object.assign(user, filteredDto);

        const savedUser = await this.userRepo.save(user);
        const safeUser = plainToInstance(UserResponseDto, savedUser, { excludeExtraneousValues: true });

        return safeUser;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }

    async findUserGrowth() {
        const data = await this.userRepo
            .createQueryBuilder('user')
            .select('DATE(user.created_at)', 'date')
            .addSelect('COUNT(*)', 'count')
            .groupBy('date')
            .orderBy('date', 'ASC')
            .getRawMany<UserGrowth>();
        const totalUsers = await this.userRepo.count();

        return { data, totalUsers: totalUsers };
    }

    async save(user: User) {
        return await this.userRepo.save(user);
    }
}
