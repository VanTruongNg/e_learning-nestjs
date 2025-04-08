import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz } from './schema/quiz.schema';
import { CreateQuizDto, GetQuizDto, UpdateQuizDto } from './dto/quiz.dto';
import { StatusCode } from 'src/common/enums/api.enum';
import { Lecture } from 'src/lecture/schema/lecture.schema';
import { QuizResponseDto } from './interface/quiz-response';

@Injectable()
export class QuizService {
    constructor(
        @InjectModel(Quiz.name) private readonly quizSchema: Model<Quiz>,
        @InjectModel(Lecture.name) private readonly lectureSchema: Model<Lecture>,
    ) {}

    async getAllQuizzes(queryDto: GetQuizDto): Promise<QuizResponseDto> {
        try {
            const page = queryDto.page || 1;
            const limit = queryDto.limit || 12;
            const skip = (page - 1) * limit;

            const [quizzes, total] = await Promise.all([
                this.quizSchema.find({ isDeleted: false }).skip(skip).limit(limit).exec(),
                this.quizSchema.countDocuments({ isDeleted: false })
            ]);
            const totalPages = Math.ceil(total / limit);

            return {
                quizzes,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages
                }
            };
        } catch (error) {
            throw error instanceof HttpException 
                ? error 
                : new HttpException('Lỗi không xác định', StatusCode.INTERNAL_SERVER);
        }
    }

    async createQuiz(data: CreateQuizDto): Promise<Quiz> {
        try {
            const lecture = await this.lectureSchema.findById(data.lectureId).exec();
            if (!lecture) {
                throw new HttpException('Bài giảng không tồn tại', StatusCode.NOT_FOUND);
            }

            if (lecture.endQuiz?.isEnabled) {
                throw new HttpException('Bài giảng đã có quiz', StatusCode.BAD_REQUEST);
            }

            const quiz = new this.quizSchema({
                ...data,
                lecture: data.lectureId,
                questions: []
            });
            const savedQuiz = await quiz.save();

            lecture.endQuiz = {
                isEnabled: true,
                quizId: savedQuiz._id as Types.ObjectId,
                requiredToComplete: true,
                minScore: data.passingScore || 70
            };
            await lecture.save();

            return savedQuiz;
        } catch (error) {
            throw error instanceof HttpException 
                ? error 
                : new HttpException('Lỗi không xác định', StatusCode.INTERNAL_SERVER);
        }
    }

    async updateQuiz(quizId: Types.ObjectId, data: UpdateQuizDto): Promise<Quiz> {
        try {
            const quiz = await this.quizSchema.findById(quizId).exec();
            if (!quiz) {
                throw new HttpException('Quiz không tồn tại', StatusCode.NOT_FOUND);
            }

            Object.assign(quiz, data);
            const updatedQuiz = await quiz.save();

            if (data.passingScore) {
                const lecture = await this.lectureSchema.findById(quiz.lecture).exec();
                if (lecture && lecture.endQuiz) {
                    lecture.endQuiz.minScore = data.passingScore;
                    await lecture.save();
                }
            }

            return updatedQuiz;
        } catch (error) {
            throw error instanceof HttpException 
                ? error 
                : new HttpException('Lỗi không xác định', StatusCode.INTERNAL_SERVER);
        }
    }

    async deleteQuiz(quizId: Types.ObjectId): Promise<void> {
        try {
            const quiz = await this.quizSchema.findById(quizId).exec();
            if (!quiz) {
                throw new HttpException('Quiz không tồn tại', StatusCode.NOT_FOUND);
            }

            const lecture = await this.lectureSchema.findById(quiz.lecture).exec();
            if (lecture && lecture.endQuiz) {
                lecture.endQuiz = undefined;
                await lecture.save();
            }

            quiz.isDeleted = true;
            await quiz.save();
        } catch (error) {
            throw error instanceof HttpException 
                ? error 
                : new HttpException('Lỗi không xác định', StatusCode.INTERNAL_SERVER);
        }
    }

    async getQuizById(quizId: Types.ObjectId): Promise<Quiz> {
        try {
            const quiz = await this.quizSchema
                .findById(new Types.ObjectId(quizId))
                .populate({
                    path: 'questions',
                    match: { isDeleted: false },
                    model: 'QuizQuestion',
                    select: 'content type options explanation points'
                })
                .populate('lecture')
                .exec();

            if (!quiz || quiz.isDeleted) {
                throw new HttpException('Quiz không tồn tại', StatusCode.NOT_FOUND);
            }

            return quiz;
        } catch (error) {
            throw error instanceof HttpException 
                ? error 
                : new HttpException('Lỗi không xác định', StatusCode.INTERNAL_SERVER);
        }
    }
}
