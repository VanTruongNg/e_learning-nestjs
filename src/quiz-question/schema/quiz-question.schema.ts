import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    SINGLE_CHOICE = 'single_choice',
    TRUE_FALSE = 'true_false'
}

export type QuizQuestionDocument = QuizQuestion & Document;

@Schema({
    timestamps: true,
})
export class QuizQuestion extends Document {
    @Prop({ required: true })
    questionText: string;

    @Prop({ type: String, enum: QuestionType, default: QuestionType.SINGLE_CHOICE })
    type: QuestionType;

    @Prop({ type: [{
        text: { type: String, required: true },
        isCorrect: { type: Boolean, required: true }
    }], required: true })
    options: Array<{
        text: string;
        isCorrect: boolean;
    }>;

    @Prop()
    explanation?: string;

    @Prop({ type: Number, default: 1 })
    points: number;

    @Prop({ type: Number, required: true })
    order: number;

    @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true, index: true })
    quizId: Types.ObjectId;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);