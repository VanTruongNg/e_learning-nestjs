import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionModule } from './transaction/transaction.module';
import { RedisModule } from './redis/redis.module';
import { CourseModule } from './course/course.module';
import { LessonModule } from './lesson/lesson.module';
import { QuizModule } from './quiz/quiz.module';

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
    QuizModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
