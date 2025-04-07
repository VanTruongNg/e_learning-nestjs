import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { QuizQuestionService } from './quiz-question.service';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/quiz-question.dto';
import { Types } from 'mongoose';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/auth/schema/user.schema';

@Controller('quiz-questions')
export class QuizQuestionController {
    constructor(private readonly quizQuestionService: QuizQuestionService) {}

    @Post()
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
        const question = await this.quizQuestionService.createQuestion(createQuestionDto);
        return {
            status: 200,
            message: 'Tạo câu hỏi thành công',
            data: question
        };
    }

    @Put(':id')
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    async updateQuestion(
        @Param('id') id: string,
        @Body() updateQuestionDto: UpdateQuestionDto
    ) {
        const question = await this.quizQuestionService.updateQuestion(
            new Types.ObjectId(id),
            updateQuestionDto
        );
        return {
            status: 200,
            message: 'Cập nhật câu hỏi thành công',
            data: question
        };
    }

    @Delete(':id')
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    async deleteQuestion(@Param('id') id: string) {
        await this.quizQuestionService.deleteQuestion(new Types.ObjectId(id));
        return {
            status: 200,
            message: 'Xóa câu hỏi thành công'
        };
    }

    @Get(':id')
    async getQuestionById(@Param('id') id: string) {
        const question = await this.quizQuestionService.getQuestionById(new Types.ObjectId(id));
        return {
            status: 200,
            message: 'Thành công',
            data: question
        };
    }

    @Get('quiz/:quizId')
    async getQuestionsByQuiz(@Param('quizId') quizId: string) {
        const questions = await this.quizQuestionService.getQuestionsByQuiz(new Types.ObjectId(quizId));
        return {
            questions
        };
    }
}
