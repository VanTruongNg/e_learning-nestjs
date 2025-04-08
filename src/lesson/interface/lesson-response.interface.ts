import { Lesson } from 'src/lesson/schema/lesson.schema';

export interface LessonResponseDto {
  lessons: Lesson[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}