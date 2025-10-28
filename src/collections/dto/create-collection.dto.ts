import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCollectionDto {
    @IsString()
    name: string;

    @IsString()
    categoryName: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;
}
