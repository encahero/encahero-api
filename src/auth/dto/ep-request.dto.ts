import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
export class EPRequestdto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    // TODO
    @IsNotEmpty()
    @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
    @MaxLength(32, { message: 'Password không được dài quá 32 ký tự' })
    // // Ví dụ nếu muốn bắt buộc có chữ hoa, chữ thường, số:
    // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    //     message: 'Password phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
    // })
    password: string;

    @IsNotEmpty()
    deviceId: string;
}
