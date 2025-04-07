import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Lecture, LectureType } from './schema/lecture.schema';
import { Model, Types } from 'mongoose';
import { Lesson } from 'src/lesson/schema/lesson.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { StatusCode } from 'src/common/enums/api.enum';
import { CreateLectureDto, VideoUploadResponse } from './dto/lecture.dto';

@Injectable()
export class LectureService {
    constructor(
        @InjectModel(Lecture.name) private readonly lectureSchema: Model<Lecture>,
        @InjectModel(Lesson.name) private readonly lessonSchema: Model<Lesson>,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    async getLecturesByLessonId(lessonId: Types.ObjectId): Promise<Lecture[]> {
        try {
            const lectures = await this.lectureSchema
                .find({ lessonId, isDeleted: false })
                .sort({ order: 1 })
                .exec();
            return lectures;
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }
}
