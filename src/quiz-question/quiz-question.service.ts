import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QuizQuestion, QuestionType } from './schema/quiz-question.schema';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/quiz-question.dto';
import { StatusCode } from 'src/common/enums/api.enum';
import { Quiz } from 'src/quiz/schema/quiz.schema';

@Injectable()
export class QuizQuestionService {
    constructor(
        @InjectModel(QuizQuestion.name) private readonly quizQuestionSchema: Model<QuizQuestion>,
        @InjectModel(Quiz.name) private readonly quizSchema: Model<Quiz>
    ) {}

    async createQuestion(data: CreateQuestionDto): Promise<QuizQuestion> {
        try {
            const quiz = await this.quizSchema.findById(data.quizId).exec();
            if (!quiz) {
                throw new HttpException('Quiz không tồn tại', StatusCode.NOT_FOUND);
            }

            this.validateQuestionData(data);

            const options = data.options.map((opt, index) => ({
                ...opt,
                id: `opt_${index + 1}`
            }));

            const quizId = data.quizId instanceof Types.ObjectId ? data.quizId : new Types.ObjectId(data.quizId);

            const question = new this.quizQuestionSchema({
                ...data,
                options,
                quizId: quizId
            });
            const savedQuestion = await question.save();

            quiz.questions.push(savedQuestion._id as Types.ObjectId);
            await quiz.save();

            return savedQuestion;
        } catch (error) {
            throw error instanceof HttpException 
                ? error 
                : new HttpException('Lỗi không xác định', StatusCode.INTERNAL_SERVER);
        }
    }

    private validateQuestionData(data: CreateQuestionDto): void {
        if (data.options.length < 2) {
            throw new HttpException('Câu hỏi phải có ít nhất 2 lựa chọn', StatusCode.BAD_REQUEST);
        }

        const correctCount = data.options.filter(opt => opt.isCorrect).length;

        switch (data.type) {
            case QuestionType.SINGLE_CHOICE:
                if (correctCount !== 1) {
                    throw new HttpException('Câu hỏi chọn một phải có đúng 1 đáp án đúng', StatusCode.BAD_REQUEST);
                }
                break;

            case QuestionType.MULTIPLE_CHOICE:
                if (correctCount < 1) {
                    throw new HttpException('Câu hỏi chọn nhiều phải có ít nhất 1 đáp án đúng', StatusCode.BAD_REQUEST);
                }
                break;

            case QuestionType.TRUE_FALSE:
                if (data.options.length !== 2) {
                    throw new HttpException('Câu hỏi Đúng/Sai phải có đúng 2 lựa chọn', StatusCode.BAD_REQUEST);
                }
                if (correctCount !== 1) {
                    throw new HttpException('Câu hỏi Đúng/Sai phải có đúng 1 đáp án đúng', StatusCode.BAD_REQUEST);
                }
                break;

            default:
                throw new HttpException('Loại câu hỏi không hợp lệ', StatusCode.BAD_REQUEST);
        }
    }

    async updateQuestion(questionId: Types.ObjectId, data: UpdateQuestionDto): Promise<QuizQuestion> {
        try {
            const question = await this.quizQuestionSchema.findById(questionId).exec();
            if (!question) {
                throw new HttpException('Câu hỏi không tồn tại', StatusCode.NOT_FOUND);
            }

            // Nếu cập nhật options
            if (data.options) {
                data.options = data.options.map((opt, index) => ({
                    ...opt,
                    id: `opt_${index + 1}`
                }));

                this.validateQuestionData({
                    ...question.toObject(),
                    ...data
                } as CreateQuestionDto);
            }

            // Cập nhật câu hỏi
            Object.assign(question, data);
            return await question.save();
        } catch (error) {
            throw error instanceof HttpException 
                ? error 
                : new HttpException('Lỗi không xác định', StatusCode.INTERNAL_SERVER);
        }
    }

    async deleteQuestion(questionId: Types.ObjectId): Promise<void> {
        try {
            const question = await this.quizQuestionSchema.findById(questionId).exec();
            if (!question) {
                throw new HttpException('Câu hỏi không tồn tại', StatusCode.NOT_FOUND);
            }

            await this.quizSchema.updateOne(
                { _id: question.quizId },
                { $pull: { questions: questionId } }
            ).exec();

            question.isDeleted = true;
            await question.save();
        } catch (error) {
            throw error instanceof HttpException 
                ? error 
                : new HttpException('Lỗi không xác định', StatusCode.INTERNAL_SERVER);
        }
    }

    async getQuestionById(questionId: Types.ObjectId): Promise<QuizQuestion> {
        try {
            const question = await this.quizQuestionSchema.findById(questionId).exec();
            if (!question || question.isDeleted) {
                throw new HttpException('Câu hỏi không tồn tại', StatusCode.NOT_FOUND);
            }
            return question;
        } catch (error) {
            throw error instanceof HttpException 
                ? error 
                : new HttpException('Lỗi không xác định', StatusCode.INTERNAL_SERVER);
        }
    }

    async getQuestionsByQuiz(quizId: Types.ObjectId): Promise<QuizQuestion[]> {
        try {
            const quiz = await this.quizSchema.findById(quizId).exec();
            if (!quiz) {
                throw new HttpException('Quiz không tồn tại', StatusCode.NOT_FOUND);
            }

            const objectId = quizId instanceof Types.ObjectId ? quizId : new Types.ObjectId(quizId);
        
            const questions1 = await this.quizQuestionSchema
                .find({
                    quizId: objectId,
                    isDeleted: false
                })
                .sort('createdAt').populate('quizId', 'timeLimit passingScore')
                .lean()
                .exec();
                
            return questions1;
        } catch (error) {
            throw error instanceof HttpException 
                ? error 
                : new HttpException('Lỗi không xác định', StatusCode.INTERNAL_SERVER);
        }
    }
}
