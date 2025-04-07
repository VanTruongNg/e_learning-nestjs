import { Body, Controller, Get, HttpException, Param, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { CourseService } from "./course.service";
import { CreateCourseDto, GetCoursesDto } from "./dto/course.dto";
import { StatusCode } from "src/common/enums/api.enum";
import { FileInterceptor } from "@nestjs/platform-express";
import { Types } from "mongoose";

@Controller("course")
export class CourseController {
    constructor(private readonly courseService: CourseService) {}

    @Get()
    @ApiOperation({ summary: "Lấy danh sách khóa học" })
    async getAllCourses(@Query() query: GetCoursesDto) {
        const courses = await this.courseService.getAllCourses(query);
        return courses;
    }

    @Get("featured")
    @ApiOperation({ summary: "Lấy danh sách khóa học nổi bật" })
    async getFeaturedCourses() {
        const courses = await this.courseService.getFeaturedCourses();
        return {
            courses,
        };
    }

    @Get("new")
    @ApiOperation({ summary: "Lấy danh sách khóa học mới" })
    async getNewCourses() {
        const courses = await this.courseService.getNewCourses();
        return {
            courses,
        };
    }

    @Get(":id")
    @ApiOperation({ summary: "Lấy thông tin khóa học" })
    async getCourseByID(@Param("id") id: string) {
        const courseId = new Types.ObjectId(id);
        const course = await this.courseService.getCourseByID(courseId);
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