import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

type DbType = 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'mssql';

export default registerAs('database', (): TypeOrmModuleOptions => {
  return {
    type: (process.env.DB_TYPE ?? 'postgres') as DbType,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: true,
  };
});
