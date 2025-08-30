import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CacheService } from 'src/redis/redis.service';

@Injectable()
export class UsersService {
  constructor(private readonly cacheService: CacheService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    console.log('User');
    await this.cacheService.setRedis('test_key', { a: 1, b: 2 }, 600000);
    return `This action returns all users 1`;
  }

  async findOne(id: number) {
    const key = await this.cacheService.getRedis<{ a: number; b: number }>(
      'test_key',
    );
    console.log('Key:', key);
    return `This action returns a #${id} user ${JSON.stringify(key)}`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
