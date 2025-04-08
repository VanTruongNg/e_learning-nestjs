import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Types } from "mongoose";
import { QuestionType } from "../schema/quiz-question.schema";

export class QuestionOptionDto {
    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsBoolean()
    isCorrect: boolean;
}

export class CreateQuestionDto {
    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsEnum(QuestionType)
    type: QuestionType;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionOptionDto)
    options: QuestionOptionDto[];

    @IsOptional()
    @IsString()
    explanation?: string;

    @IsOptional()
    @IsNumber()
    points?: number;

    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    quizId: Types.ObjectId;
}

export class UpdateQuestionDto {
    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsEnum(QuestionType)
    type?: QuestionType;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionOptionDto)
    options?: QuestionOptionDto[];

    @IsOptional()
    @IsString()
    explanation?: string;

    @IsOptional()
    @IsNumber()
    points?: number;
}

// Ví dụ mẫu cho các loại câu hỏi:

/*
1. Câu hỏi chọn một (SINGLE_CHOICE):
{
    "content": "Đâu là framework phổ biến nhất cho Node.js?",
    "type": "single_choice",
    "options": [
        {
            "content": "Express.js",
            "isCorrect": true
        },
        {
            "content": "Koa.js",
            "isCorrect": false
        },
        {
            "content": "Hapi.js",
            "isCorrect": false
        },
        {
            "content": "Fastify",
            "isCorrect": false
        }
    ],
    "explanation": "Express.js là framework phổ biến nhất cho Node.js với cộng đồng lớn và nhiều tài liệu.",
    "points": 1,
    "quizId": "67f36d5b2597d5f777114014"
}

2. Câu hỏi chọn nhiều (MULTIPLE_CHOICE):
{
    "content": "TypeScript cung cấp những tính năng nào sau đây?",
    "type": "multiple_choice",
    "options": [
        {
            "content": "Static typing",
            "isCorrect": true
        },
        {
            "content": "Interface",
            "isCorrect": true
        },
        {
            "content": "Decorators",
            "isCorrect": true
        },
        {
            "content": "Garbage collection",
            "isCorrect": false
        }
    ],
    "explanation": "TypeScript cung cấp static typing, interface và decorators. Garbage collection là tính năng của JavaScript runtime.",
    "points": 2,
    "quizId": "67f36d5b2597d5f777114014"
}

3. Câu hỏi Đúng/Sai (TRUE_FALSE):
{
    "content": "Node.js chỉ có thể chạy trên một thread duy nhất.",
    "type": "true_false",
    "options": [
        {
            "content": "Đúng",
            "isCorrect": false
        },
        {
            "content": "Sai",
            "isCorrect": true
        }
    ],
    "explanation": "Node.js có thể chạy đa luồng thông qua Worker Threads.",
    "points": 1,
    "quizId": "67f36d5b2597d5f777114014"
}
*/