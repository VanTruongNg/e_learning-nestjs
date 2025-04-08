import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Lecture, LectureType } from './schema/lecture.schema';
import { Model, Types } from 'mongoose';
import { Lesson } from 'src/lesson/schema/lesson.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { StatusCode } from 'src/common/enums/api.enum';
import { CreateLectureDto, GetLectureDto, UpdateLectureDto, VideoUploadResponse } from './dto/lecture.dto';
import { LectureResponseDto } from './interface/lecture-response.interface';

@Injectable()
export class LectureService {
    constructor(
        @InjectModel(Lecture.name) private readonly lectureSchema: Model<Lecture>,
        @InjectModel(Lesson.name) private readonly lessonSchema: Model<Lesson>,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    async getAllLectures(queryDto: GetLectureDto): Promise<LectureResponseDto> {
        try {
            const page = queryDto.page || 1;
            const limit = queryDto.limit || 12;
            const skip = (page - 1) * limit;

            const [lectures, total] = await Promise.all([
                this.lectureSchema.find({ isDeleted: false }).skip(skip).limit(limit).exec(),
                this.lectureSchema.countDocuments()
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                lectures,
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


    async getLecturesByLessonId(lectureId: Types.ObjectId): Promise<Lecture> {
        try {
            const lectures = await this.lectureSchema.findById(lectureId).exec();
            return lectures;
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async createLecture(data: CreateLectureDto): Promise<Lecture> {
        try {
            const lesson = await this.lessonSchema.findById(data.lessonId);
            if (!lesson) {
                throw new HttpException("Bài học không tồn tại", StatusCode.NOT_FOUND);
            }

            if (!data['content.text'] && !data['content.video']) {
                throw new HttpException(
                    "Bài giảng kiểu MIXED cần có ít nhất một trong hai: nội dung văn bản hoặc video",
                    StatusCode.BAD_REQUEST
                );
            }

            const lastLecture = await this.lectureSchema
                .findOne({ lessonId: lesson._id, isDeleted: false })
                .sort({ order: -1 })
                .exec();

            const newLecture = new this.lectureSchema({
                title: data.title,
                description: data.description,
                type: data.type,
                lessonId: lesson._id,
                order: lastLecture ? lastLecture.order + 1 : 1,
                isDeleted: false,
                content: {
                    text: data['content.text'],
                    duration: data['content.duration']
                }
            });

            if (data['content.video']) {
                const videoUrl = await this.cloudinaryService.uploadFileAsync(data['content.video'], {
                    folder: 'lectures',
                    fileName: newLecture._id.toString(),
                    resourceType: 'video'
                });
                newLecture.content.videoUrl = videoUrl;
            }

            lesson.lectures.push(newLecture._id as Types.ObjectId);
            await lesson.save();

            return await newLecture.save();
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }
    
    async updateLecture(id: Types.ObjectId, updateData: UpdateLectureDto): Promise<Lecture> {
        try {
            const lecture = await this.lectureSchema.findById(id);
            if (!lecture) {
                throw new HttpException("Bài giảng không tồn tại", StatusCode.NOT_FOUND);
            }
    
            if (updateData.title) lecture.title = updateData.title;
            if (updateData.description) lecture.description = updateData.description;
            if (updateData.type) lecture.type = updateData.type;
            if (updateData['content.text']) lecture.content.text = updateData['content.text'];
            if (updateData['content.duration']) lecture.content.duration = updateData['content.duration'];

            if (updateData['content.video']) {
                const videoUrl = await this.cloudinaryService.uploadFileAsync(updateData['content.video'], {
                    folder: 'lectures',
                    fileName: lecture._id.toString(),
                    resourceType: 'video'
                });
                lecture.content.videoUrl = videoUrl;
            }
    
            return await lecture.save();
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async deleteLecture(id: Types.ObjectId): Promise<void> {
        try {
            const lecture = await this.lectureSchema.findById(id);
            if (!lecture) {
                throw new HttpException("Bài giảng không tồn tại", StatusCode.NOT_FOUND);
            }

            lecture.isDeleted = true;
            await lecture.save();
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }
}
