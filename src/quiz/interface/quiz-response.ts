import { Quiz } from 'src/quiz/schema/quiz.schema';

export interface QuizResponseDto {
  quizzes: Quiz[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}