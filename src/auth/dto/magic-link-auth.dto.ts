import { IsEmail } from 'class-validator';
export class MagicLinkAuthDto {
    @IsEmail()
    email: string;
}
