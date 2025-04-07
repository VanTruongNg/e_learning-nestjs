import { Module } from '@nestjs/common';
import { LectureService } from './lecture.service';
import { LectureController } from './lecture.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Lecture, LectureSchema } from './schema/lecture.schema';
import { LessonModule } from 'src/lesson/lesson.module';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lecture.name, schema: LectureSchema },
    ]),
    LessonModule,
    AuthModule,
    CloudinaryModule
  ],
  controllers: [LectureController],
  providers: [LectureService],
  exports: [LectureService, MongooseModule]
})
export class LectureModule {}
