import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import { ERROR_MESSAGES } from 'src/constants';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';

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

    findAll() {
        return {
            data: 'Hello',
        };
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
