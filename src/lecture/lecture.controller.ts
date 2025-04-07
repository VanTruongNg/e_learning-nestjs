import { Body, Controller, Get, Param, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateLectureDto } from './dto/lecture.dto';
import { LectureService } from './lecture.service';
import { AuthGuard } from '@nestjs/passport';
import { Types } from 'mongoose';

@Controller('lectures')
@ApiTags('Lectures')
export class LectureController {
    constructor(private readonly lectureService: LectureService) {}

    @Get("lesson/:lessonId")
    @ApiOperation({ summary: "Lấy danh sách bài giảng theo bài học" })
    async getLecturesByLessonId(@Param("lessonId") lessonId: string) {
        const lectures = await this.lectureService.getLecturesByLessonId(new Types.ObjectId(lessonId));
        return lectures;
    }
}


