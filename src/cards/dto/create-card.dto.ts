import { IsString, IsEnum, IsArray, ArrayMinSize, IsOptional, IsNumber } from 'class-validator';
import { CardType } from '../entities/card.entity';
import { Transform } from 'class-transformer';

export class CreateCardDto {
    @IsString()
    en_word: string;

    @IsArray()
    @ArrayMinSize(4, { message: 'vn_choice phải có ít nhất 4 phần tử' })
    @Transform(({ value }: { value: string }) => {
        return JSON.parse(value) as string[];
    })
    vn_choice: string[];

    @IsString()
    vn_word: string;

    @IsArray()
    @ArrayMinSize(4, { message: 'en_choice phải có ít nhất 4 phần tử' })
    @Transform(({ value }: { value: string }) => {
        return JSON.parse(value) as string[];
    })
    en_choice: string[];

    @IsString()
    meaning: string;

    @IsString()
    phonetic: string;

    @IsArray()
    @Transform(({ value }: { value: string }) => {
        return JSON.parse(value) as string[];
    })
    ex: string[];

    @IsString()
    @IsOptional()
    image_url?: string;

    @IsEnum(CardType)
    type: CardType;

    @IsNumber()
    @Transform(({ value }) => Number(value))
    collectionId: number; // dùng để liên kết với Collection
}
