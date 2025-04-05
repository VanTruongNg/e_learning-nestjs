import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from './schema/course.schema';
import { Model } from 'mongoose';
import { StatusCode } from 'src/common/enums/api.enum';
import { CourseResponse } from './interfaces/course-response.interface';
import { CreateCourseDto, GetCoursesDto } from './dto/course.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class CourseService {
    constructor(
        @InjectModel(Course.name) private readonly courseSchema: Model<Course>,
        private readonly cloudinaryService: CloudinaryService
    ) {}
    
    async getAllCourses(queryDto: GetCoursesDto): Promise<CourseResponse> {
        try {
            const page = queryDto.page || 1;
            const limit = queryDto.limit || 12;
            const skip = (page - 1) * limit;

            const [courses, total] = await Promise.all([
                this.courseSchema.find().skip(skip).limit(limit).exec(),
                this.courseSchema.countDocuments()
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                courses,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages
                }
            };
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async getCourseByID (id: string): Promise<Course> {
        try {
            const course = await this.courseSchema.findById(id).exec();
            if (!course) {
                throw new HttpException("Khóa học không tồn tại", StatusCode.NOT_FOUND);
            }

            return course
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async createCourse (course: CreateCourseDto): Promise<Course> {
        try {
            const { title, description, price, level, thumbnail } = course;

            const newCourse = new this.courseSchema({
                title,
                description,
                price,
                level
            })

            const url = await this.cloudinaryService.uploadFileAsync(thumbnail, {
                folder: 'courses',
                fileName: newCourse._id.toString()
            })
            newCourse.thumbnailUrl = url;

            return await newCourse.save();
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }
}
