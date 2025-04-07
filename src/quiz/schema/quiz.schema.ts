import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

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

    @Prop({ type: [{ type: Types.ObjectId, ref: 'QuizQuestion' }], default: [] })
    questions: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'Lecture', required: true, index: true })
    lecture: Types.ObjectId;

    @Prop({ type: Number, default: 0 })
    totalAttempts: number;

    @Prop({ type: Number, default: 0 })
    averageScore: number;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);