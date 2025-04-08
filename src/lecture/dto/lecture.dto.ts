import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { LectureType } from '../schema/lecture.schema';
import { Types } from 'mongoose';

export interface VideoUploadResponse {
    url: string;
    duration?: number;
}

export class CreateLectureDto {
    @ApiProperty({ description: 'Tiêu đề bài giảng' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Mô tả bài giảng' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ enum: LectureType, description: 'Loại bài giảng' })
    @IsEnum(LectureType)
    @IsNotEmpty()
    type: LectureType;

    @ApiProperty({ description: 'ID của bài học chứa bài giảng này' })
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    lessonId: Types.ObjectId;

    @ApiPropertyOptional({ description: 'Nội dung văn bản của bài giảng' })
    @IsString()
    @IsOptional()
    'content.text'?: string;

    @ApiPropertyOptional({ 
        description: 'File video của bài giảng',
        type: 'string',
        format: 'binary'
    })
    @IsOptional()
    'content.video'?: Express.Multer.File;

    @ApiPropertyOptional({ description: 'Thời lượng của video (tính bằng giây)' })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    'content.duration'?: number;
}

export class GetLectureDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class UpdateLectureDto {
    @ApiPropertyOptional({ description: 'Tiêu đề bài giảng' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ description: 'Mô tả bài giảng' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: LectureType, description: 'Loại bài giảng' })
    @IsEnum(LectureType)
    @IsOptional()
    type?: LectureType;

    @ApiPropertyOptional({ description: 'Nội dung văn bản của bài giảng' })
    @IsString()
    @IsOptional()
    'content.text'?: string;

    @ApiPropertyOptional({
        description: 'File video của bài giảng',
        type: 'string',
        format: 'binary'
    })
    @IsOptional()
    'content.video'?: Express.Multer.File;

    @ApiPropertyOptional({ description: 'Thời lượng của video (tính bằng giây)' })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    'content.duration'?: number;
}