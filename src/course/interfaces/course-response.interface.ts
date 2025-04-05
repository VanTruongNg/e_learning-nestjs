import { Course } from '../schema/course.schema';

export interface CourseResponse {
  courses: Course[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}