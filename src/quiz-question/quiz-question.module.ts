import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizQuestion, QuizQuestionSchema } from './schema/quiz-question.schema';
import { QuizQuestionController } from './quiz-question.controller';
import { QuizQuestionService } from './quiz-question.service';
import { Quiz, QuizSchema } from 'src/quiz/schema/quiz.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: QuizQuestion.name, schema: QuizQuestionSchema },
            { name: Quiz.name, schema: QuizSchema }
        ]),
        AuthModule
    ],
    controllers: [QuizQuestionController],
    providers: [QuizQuestionService],
    exports: [QuizQuestionService]
})
export class QuizQuestionModule {}
