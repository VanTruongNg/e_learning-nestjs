import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { LectureType } from '../schema/lecture.schema';
import { Types } from 'mongoose';

export interface VideoUploadResponse {
    url: string;
    duration?: number;
}

export class LectureContentDto {
    @ApiPropertyOptional({ description: 'Nội dung văn bản của bài giảng' })
    @IsString()
    @IsOptional()
    text?: string;

    @ApiPropertyOptional({ 
        description: 'File video của bài giảng',
        type: 'string',
        format: 'binary'
    })
    @IsOptional()
    video?: Express.Multer.File;

    @ApiPropertyOptional({ description: 'Thời lượng của video (tính bằng giây)' })
    @IsNumber()
    @IsOptional()
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

    @ApiProperty({ description: 'Nội dung bài giảng' })
    @ValidateNested()
    @Type(() => LectureContentDto)
    content: LectureContentDto;

    @ApiProperty({ description: 'ID của bài học chứa bài giảng này' })
    @IsNotEmpty()
    lessonId: string;
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

    @ApiPropertyOptional({ description: 'Nội dung bài giảng' })
    @ValidateNested()
    @Type(() => LectureContentDto)
    @IsOptional()
    content?: LectureContentDto;
}

// DTO cho việc thêm/cập nhật quiz cho bài giảng
export class UpdateLectureQuizDto {
    @ApiProperty({ description: 'Trạng thái bật/tắt quiz cuối bài' })
    @IsBoolean()
    @IsNotEmpty()
    isEnabled: boolean;

    @ApiProperty({ description: 'ID của bài quiz' })
    @IsMongoId()
    @IsOptional()
    quizId?: Types.ObjectId;

    @ApiProperty({ description: 'Yêu cầu hoàn thành quiz để qua bài' })
    @IsBoolean()
    @IsNotEmpty()
    requiredToComplete: boolean;

    @ApiProperty({ description: 'Điểm tối thiểu để vượt qua (0-100)' })
    @IsNumber()
    @IsNotEmpty()
    minScore: number;
}