import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLectureDto, GetLectureDto, UpdateLectureDto } from './dto/lecture.dto';
import { LectureService } from './lecture.service';
import { AuthGuard } from '@nestjs/passport';
import { Types } from 'mongoose';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/schema/user.schema';

@Controller('lectures')
@ApiTags('Lectures')
export class LectureController {
    constructor(private readonly lectureService: LectureService) {}

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Lấy danh sách bài giảng' })
    async getAllLectures(@Query() query: GetLectureDto) {
        const lectures = await this.lectureService.getAllLectures(query);
        return lectures;
    }


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

    @Put('/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'content.video', maxCount: 1 }
        ])
    )
    @ApiOperation({ summary: 'Cập nhật thông tin bài giảng' })
    @ApiConsumes('multipart/form-data')
    async updateLecture(
        @Param('id') id: string,
        @Body() updateLectureDto: UpdateLectureDto,
        @UploadedFiles() files: { 'content.video'?: Express.Multer.File[] }
    ) {
        const lectureData = {
            ...updateLectureDto,
            'content.video': files['content.video']?.[0]
        };

        return this.lectureService.updateLecture(new Types.ObjectId(id), lectureData);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Xóa bài giảng' })
    async deleteLecture(@Param('id') id: string) {
        return this.lectureService.deleteLecture(new Types.ObjectId(id));
    }
}
