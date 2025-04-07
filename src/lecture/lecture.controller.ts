import { Body, Controller, Get, HttpException, Param, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateLectureDto } from './dto/lecture.dto';
import { LectureService } from './lecture.service';
import { AuthGuard } from '@nestjs/passport';
import { Types } from 'mongoose';
import { StatusCode } from 'src/common/enums/api.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/schema/user.schema';

@Controller('lectures')
@ApiTags('Lectures')
export class LectureController {
    constructor(private readonly lectureService: LectureService) {}

    @Get("/:lectureId")
    @ApiOperation({ summary: "Lấy danh sách bài giảng theo bài học" })
    async getLecturesByLessonId(@Param("lectureId") lectureId: string) {
        const lectures = await this.lectureService.getLecturesByLessonId(new Types.ObjectId(lectureId));
        return lectures;
    }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'content.video', maxCount: 1 }
        ])
    )
    @ApiOperation({ summary: 'Tạo mới một bài giảng' })
    @ApiConsumes('multipart/form-data')
    async createLecture(
        @Body() createLectureDto: CreateLectureDto,
        @UploadedFiles() files: { 'content.video'?: Express.Multer.File[] }
    ) {
        const lectureData = {
            ...createLectureDto,
            'content.video': files['content.video']?.[0]
        };

        return this.lectureService.createLecture(lectureData);
    }
}
