import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { QuestionType } from "../../quiz-question/schema/quiz-question.schema";
import { Type } from "class-transformer";
import { Types } from "mongoose";

class OptionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    isCorrect: boolean;
}

export class CreateQuizQuestionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    questionText: string;

    @ApiProperty({ enum: QuestionType })
    @IsEnum(QuestionType)
    type: QuestionType;

    @ApiProperty({ type: [OptionDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OptionDto)
    options: OptionDto[];

    @ApiProperty()
    @IsOptional()
    @IsString()
    explanation?: string;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    points: number;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    order: number;

    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    quizId: Types.ObjectId;
}

export class UpdateQuizQuestionDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    questionText?: string;

    @ApiProperty({ enum: QuestionType })
    @IsOptional()
    @IsEnum(QuestionType)
    type?: QuestionType;

    @ApiProperty({ type: [OptionDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OptionDto)
    options?: OptionDto[];

    @ApiProperty()
    @IsOptional()
    @IsString()
    explanation?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Min(1)
    points?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Min(1)
    order?: number;
}

export class QuizQuestionResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    questionText: string;

    @ApiProperty({ enum: QuestionType })
    type: QuestionType;

    @ApiProperty({ type: [OptionDto] })
    options: OptionDto[];

    @ApiProperty()
    explanation?: string;

    @ApiProperty()
    points: number;

    @ApiProperty()
    order: number;

    @ApiProperty()
    quizId: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}