import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Lesson, LessonSchema } from './schema/lesson.schema';
import { Model, Types } from 'mongoose';
import { StatusCode } from 'src/common/enums/api.enum';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { Course } from 'src/course/schema/course.schema';

@Injectable()
export class LessonService {
    constructor(
        @InjectModel(Lesson.name) private readonly lessonSchema: Model<Lesson>,
        @InjectModel(Course.name) private readonly courseSchame: Model<Course>,
    ) {}

    async getLessonById(lessonId: Types.ObjectId): Promise<Lesson> {
        try {
            const lesson = await this.lessonSchema
                .findById(lessonId)
                .populate('lectures')
                .exec();

            if (!lesson) {
                throw new HttpException("Bài học không tồn tại", StatusCode.NOT_FOUND);
            }
                
            return lesson;
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async createLesson(data: CreateLessonDto): Promise<Lesson> {
        try {
            const { title, description, courseId } = data;
            const course = await this.courseSchame.findById(courseId).exec();
            if (!course) {
                throw new HttpException("Khóa học không tồn tại", StatusCode.NOT_FOUND);
            }

            const lastLesson = await this.lessonSchema.findOne({
                courseId: course._id, isDeleted: false
            }).sort({ order: -1 }).exec();
            const newOrder = lastLesson ? lastLesson.order + 1 : 1;

            const lesson = new this.lessonSchema({
                title,
                courseId,
                description,
                totalDuration: 0,
                order: newOrder,
            });
            const savedLesson = await lesson.save();

            course.lessons.push(savedLesson._id as Types.ObjectId);
            await course.save();

            return savedLesson;
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async updateLesson(data: UpdateLessonDto, lessonId: Types.ObjectId): Promise<Lesson> {
        try {
            const { title, description } = data;
            const lesson = await this.lessonSchema.findById(lessonId).exec();
            if (!lesson) {
                throw new HttpException("Bài học không tồn tại", StatusCode.NOT_FOUND);
            }

            if (title) lesson.title = title;
            if (description) lesson.description = description;

            await lesson.save();
            return lesson;
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async deleteLesson(lessonId: Types.ObjectId): Promise<Lesson> {
        try {
            const lesson = await this.lessonSchema.findById(lessonId).exec();
            if (!lesson || lesson.isDeleted) {
                throw new HttpException("Bài học không tồn tại", StatusCode.NOT_FOUND);
            }

            lesson.isDeleted = true;
            await lesson.save();
            return lesson;
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }
}

