import { IsEmail, IsNotEmpty } from 'class-validator';
export class MagicLinkAuthDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
