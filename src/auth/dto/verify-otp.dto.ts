import { IsEmail, IsNumber } from 'class-validator';

export class VerifyOtpDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @IsNumber({}, { message: 'OTP phải là số' })
    otp: number;
}
