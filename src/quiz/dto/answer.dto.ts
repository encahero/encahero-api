import { IsEnum, IsOptional } from 'class-validator';
import { CardRating } from 'src/progress/entities/user-card-progress.entity';

export enum QuestionType {
    MULTI_CHOICE = 'multi_choice',
    RATING = 'rating',
    TYPING = 'typing',
}

export class AnswerDto {
    @IsEnum(QuestionType)
    questionType: QuestionType;

    @IsOptional()
    @IsEnum(CardRating)
    ratingValue?: CardRating;
}
