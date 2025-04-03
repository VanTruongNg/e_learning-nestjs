import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    SINGLE_CHOICE = 'single_choice',
    TRUE_FALSE = 'true_false'
}

export type QuizDocument = Quiz & Document;

@Schema({
    timestamps: true,
})
export class Quiz extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ type: Number, required: true, default: 600 })
    timeLimit: number;

    @Prop({ type: Number, required: true, default: 70 })
    passingScore: number;

    @Prop({ type: [{
        questionText: { type: String, required: true },
        type: { type: String, enum: QuestionType, default: QuestionType.SINGLE_CHOICE },
        options: [{
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true }
        }],
        explanation: { type: String },
        points: { type: Number, default: 1 }
    }], required: true })
    questions: Array<{
        questionText: string;
        type: QuestionType;
        options: Array<{
            text: string;
            isCorrect: boolean;
        }>;
        explanation?: string;
        points: number;
    }>;

    @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true, index: true })
    lessonId: Types.ObjectId;

    @Prop({ type: Number, default: 0 })
    totalAttempts: number;

    @Prop({ type: Number, default: 0 })
    averageScore: number;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);