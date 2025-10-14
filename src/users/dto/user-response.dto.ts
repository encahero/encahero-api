import { Expose } from 'class-transformer';

export class UserResponseDto {
    @Expose()
    id: string;
    @Expose()
    email: string;
    @Expose()
    username: string;
    @Expose()
    firstName: string;
    @Expose()
    lastName: string;
    @Expose()
    avatar: string;
    @Expose()
    time_zone: string;
    @Expose()
    created_at: Date;
}
