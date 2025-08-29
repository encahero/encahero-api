import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from 'src/config/database.config';
import { DatabaseService } from './database.service';

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig)],
  providers: [DatabaseService],
})
export class DatabaseModule {}
