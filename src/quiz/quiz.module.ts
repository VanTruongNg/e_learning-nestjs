import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from './schema/quiz.schema';
import { LectureModule } from 'src/lecture/lecture.module';
import { AuthModule } from 'src/auth/auth.module';
import { QuizQuestionModule } from 'src/quiz-question/quiz-question.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
    ]),
    LectureModule,
    AuthModule,
    QuizQuestionModule
  ],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
