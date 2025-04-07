import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateQuizDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsNumber()
    timeLimit?: number;

    @IsOptional()
    @IsNumber()
    passingScore?: number;

    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    lectureId: Types.ObjectId;
}

export class UpdateQuizDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    timeLimit?: number;

    @IsOptional()
    @IsNumber()
    passingScore?: number;
}