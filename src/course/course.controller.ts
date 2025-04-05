import { Body, Controller, Get, HttpException, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { CourseService } from "./course.service";
import { CreateCourseDto, GetCoursesDto } from "./dto/course.dto";
import { StatusCode } from "src/common/enums/api.enum";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("course")
export class CourseController {
    constructor(private readonly courseService: CourseService) {}

    @Get()
    @ApiOperation({ summary: "Lấy danh sách khóa học" })
    async getAllCourses(@Query() query: GetCoursesDto) {
        const courses = await this.courseService.getAllCourses(query);
        return courses;
    }

    @Get(":id")
    @ApiOperation({ summary: "Lấy thông tin khóa học" })
    async getCourseByID(@Query("id") id: string) {
        if (!id) {
            throw new HttpException("ID không hợp lệ", StatusCode.BAD_REQUEST);
        }
        const course = await this.courseService.getCourseByID(id);
        return course;
    }

    @Post()
    @ApiOperation({ summary: "Tạo khóa học" })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: CreateCourseDto })
    @UseInterceptors(FileInterceptor('thumbnail'))
    async createCourse(
        @Body() courseData: Omit<CreateCourseDto, 'thumbnail'>,
        @UploadedFile() thumbnail: Express.Multer.File
    ) {
        if (!thumbnail) {
            throw new HttpException('Ảnh đại diện khóa học là bắt buộc', StatusCode.BAD_REQUEST);
        }
        const course = {
            ...courseData,
            thumbnail
        };
        const newCourse = await this.courseService.createCourse(course);
        return newCourse;
    }
}