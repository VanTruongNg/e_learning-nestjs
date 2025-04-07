import { Controller } from '@nestjs/common';
import { QuizQuestionService } from './quiz-question.service';

@Controller('quiz-question')
export class QuizQuestionController {
  constructor(private readonly quizQuestionService: QuizQuestionService) {}
}
