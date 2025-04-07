import { Body, Controller, Delete, Get, HttpException, Param, Post, Put, UseGuards } from "@nestjs/common";
import { LessonService } from "./lesson.service";
import { StatusCode } from "src/common/enums/api.enum";
import { CreateLessonDto, UpdateLessonDto } from "./dto/lesson.dto";
import { AuthGuard } from "@nestjs/passport";
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Types } from "mongoose";

@ApiTags('Lesson')
@Controller("lesson")
export class LessonController {
    constructor(private readonly lessonService: LessonService) {}

    @Get("course/:courseId")
    async getLessonsByCourseId(@Param("courseId") courseId: string) {
        const lessons = await this.lessonService.getLessonsByCourseId(new Types.ObjectId(courseId));
        return lessons;
    }

    @Post()
    @UseGuards(AuthGuard("jwt"))
    @ApiOperation({ summary: "Tạo bài học" })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: CreateLessonDto })
    async createLesson(@Body() lessonData: CreateLessonDto) {
        const lesson = await this.lessonService.createLesson({
            ...lessonData,
            courseId: new Types.ObjectId(lessonData.courseId)
        });
        return lesson;
    }

    @Put("update/:lessonId")
    @UseGuards(AuthGuard("jwt"))
    @ApiOperation({ summary: "Cập nhật bài học" })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UpdateLessonDto })
    async updateLesson(
        @Body() lessonData: UpdateLessonDto,
        @Param("lessonId") lessonId: string
    ) {
        try {
            const lesson = await this.lessonService.updateLesson(lessonData, new Types.ObjectId(lessonId));
            return lesson;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException("Bài học không tồn tại", StatusCode.NOT_FOUND);
        }
    }

    @Delete("delete/:lessonId")
    @UseGuards(AuthGuard("jwt"))
    @ApiOperation({ summary: "Xóa bài học" })
    async deleteLesson(@Param("lessonId") lessonId: string) {
        try {
            const lesson = await this.lessonService.deleteLesson(new Types.ObjectId(lessonId));
            return lesson;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException("Bài học không tồn tại", StatusCode.NOT_FOUND);
        }
    }
}