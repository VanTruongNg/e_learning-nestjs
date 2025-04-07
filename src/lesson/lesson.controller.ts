import { Body, Controller, Delete, Get, HttpException, Param, Post, Put, UseGuards } from "@nestjs/common";
import { LessonService } from "./lesson.service";
import { StatusCode } from "src/common/enums/api.enum";
import { CreateLessonDto, UpdateLessonDto } from "./dto/lesson.dto";
import { AuthGuard } from "@nestjs/passport";
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Types } from "mongoose";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/schema/user.schema";

@ApiTags('Lesson')
@Controller("lesson")
export class LessonController {
    constructor(private readonly lessonService: LessonService) {}

    @Get("/:id")
    async getLessonsId(@Param("id") lessonId: string) {
        const lessons = await this.lessonService.getLessonById(new Types.ObjectId(lessonId));
        return lessons;
    }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: "Tạo bài học" })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: CreateLessonDto })
    async createLesson(@Body() lessonData: CreateLessonDto) {
        const lesson = await this.lessonService.createLesson(lessonData);
        return lesson;
    }

    @Put("update/:lessonId")
    @UseGuards(AuthGuard("jwt"))
    @Roles(Role.ADMIN)
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
    @Roles(Role.ADMIN)
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