import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum QuestionType {
    SINGLE_CHOICE = 'single_choice',
    MULTIPLE_CHOICE = 'multiple_choice',
    TRUE_FALSE = 'true_false'
}

export interface QuestionOption {
    id: string;
    content: string;
    isCorrect: boolean;
}

@Schema({
    timestamps: true,
})
export class QuizQuestion extends Document {
    @Prop({ required: true })
    content: string;

    @Prop({ type: String, enum: QuestionType, required: true })
    type: QuestionType;

    @Prop({ 
        type: [{
            id: { type: String, required: true },
            content: { type: String, required: true },
            isCorrect: { type: Boolean, required: true }
        }],
        required: true,
        _id: false,
    })
    options: QuestionOption[];

    @Prop({ type: String })
    explanation?: string;

    @Prop({ type: Number, default: 1 })
    points: number;

    @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true, index: true })
    quizId: Types.ObjectId;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);