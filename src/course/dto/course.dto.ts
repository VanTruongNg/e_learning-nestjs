import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { CourseLevel } from '../schema/course.schema';

export class GetCoursesDto {
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

export class CreateCourseDto {
  @IsNotEmpty({ message: 'Tên khóa học không được để trống' })
  @IsString({ message: 'Tên khóa học phải là chuỗi ký tự' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Mô tả khóa học phải là chuỗi ký tự' })
  description?: string;

  @IsNotEmpty({ message: 'Giá khóa học không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Giá khóa học phải là số nguyên' })
  @Min(0, { message: 'Giá khóa học phải lớn hơn hoặc bằng 0' })
  price: number;

  @IsEnum(CourseLevel, { message: 'Cấp độ khóa học không hợp lệ. Chỉ chấp nhận: beginner, intermediate, advanced' })
  @IsNotEmpty({ message: 'Cấp độ khóa học không được để trống' })
  level: CourseLevel;

  thumbnail?: Express.Multer.File;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString({ message: 'Tên khóa học phải là chuỗi ký tự' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả khóa học phải là chuỗi ký tự' })
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Giá khóa học phải là số nguyên' })
  @Min(0, { message: 'Giá khóa học phải lớn hơn hoặc bằng 0' })
  price?: number;

  @IsOptional()
  @IsEnum(CourseLevel, { message: 'Cấp độ khóa học không hợp lệ. Chỉ chấp nhận: beginner, intermediate, advanced' })
  level?: CourseLevel;

  thumbnail?: Express.Multer.File;
}