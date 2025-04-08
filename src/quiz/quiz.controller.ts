import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto, GetQuizDto, UpdateQuizDto } from './dto/quiz.dto';
import { Types } from 'mongoose';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/auth/schema/user.schema';
import { ApiOperation } from '@nestjs/swagger';

@Controller('quiz')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @Get()
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: "Lấy tất cả bài học" })
    async getAllLessons(@Query() query: GetQuizDto) {
        const lessons = await this.quizService.getAllQuizzes(query);
        return lessons;
    }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    async createQuiz(@Body() createQuizDto: CreateQuizDto) {
        const quiz = await this.quizService.createQuiz(createQuizDto);
        return quiz;
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    async updateQuiz(
        @Param('id') id: string,
        @Body() updateQuizDto: UpdateQuizDto
    ) {
        const quiz = await this.quizService.updateQuiz(
            new Types.ObjectId(id),
            updateQuizDto
        );
        return {
            quiz
        };
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    async deleteQuiz(@Param('id') id: string) {
        await this.quizService.deleteQuiz(new Types.ObjectId(id));
        return {
            message: 'Xóa quiz thành công'
        };
    }

    @Get(':id')
    async getQuizById(@Param('id') id: string) {
        const quiz = await this.quizService.getQuizById(new Types.ObjectId(id));
        return {
            quiz
        };
    }
}
