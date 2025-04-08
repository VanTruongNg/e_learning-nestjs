import { Lecture } from "../schema/lecture.schema";


export interface LectureResponseDto {
  lectures: Lecture[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}