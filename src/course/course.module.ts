import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './schema/course.schema';
import { CourseController } from './course.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
    ]),
    CloudinaryModule
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [MongooseModule, CourseService]
})
export class CourseModule {}
