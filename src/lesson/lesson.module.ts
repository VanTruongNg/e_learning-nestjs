import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { Lesson, LessonSchema } from './schema/lesson.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CourseModule } from 'src/course/course.module';
import { AuthModule } from 'src/auth/auth.module';
import { LectureModule } from 'src/lecture/lecture.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Lesson.name, schema: LessonSchema },
        ]),
        CloudinaryModule,
        CourseModule,
        AuthModule,
        forwardRef(() => LectureModule),
    ],
    controllers: [LessonController],
    providers: [LessonService],
    exports: [LessonService, MongooseModule]
})
export class LessonModule {}
