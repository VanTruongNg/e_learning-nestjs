import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionModule } from './transaction/transaction.module';
import { RedisModule } from './redis/redis.module';
import { CourseModule } from './course/course.module';
import { LessonModule } from './lesson/lesson.module';
import { QuizModule } from './quiz/quiz.module';
import { QueueModule } from './queue/queue.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PaymentModule } from './payment/payment.module';
import { LectureModule } from './lecture/lecture.module';
import { QuizQuestionModule } from './quiz-question/quiz-question.module';

@Module({
  imports: [
    // Config module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),

    // MongoDB
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      autoIndex: true,
    }),

    // Feature modules
    AuthModule,
    RedisModule,
    TransactionModule,
    MailModule,
    CourseModule,
    LessonModule,
    QuizModule,
    QueueModule,
    CloudinaryModule,
    PaymentModule,
    LectureModule,
    QuizQuestionModule
  ],
  providers: [AppService],
})
export class AppModule {}
