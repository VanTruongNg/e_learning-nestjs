import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum LessonType {
    TEXT = 'text',
    VIDEO = 'video',
    MIXED = 'mixed'
}

export enum LessonStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published'
}

export type LessonDocument = Lesson & Document;

@Schema({
    timestamps: true,
})
export class Lesson extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ type: String, enum: LessonType, default: LessonType.TEXT })
    type: LessonType;

    @Prop({ type: Number, required: true })
    order: number;

    @Prop({
        type: {
            text: { type: String },
            videoUrl: { type: String },
            duration: { type: Number },
        }
    })
    content: {
        text?: string;
        videoUrl?: string;
        duration?: number;
    };

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
    courseId: Types.ObjectId;

    @Prop({
        type: {
            isEnabled: { type: Boolean, default: false },
            quizId: { type: Types.ObjectId, ref: 'Quiz' },
            requiredToComplete: { type: Boolean, default: true },
            minScore: { type: Number, default: 70 }
        }
    })
    endQuiz?: {
        isEnabled: boolean;
        quizId?: Types.ObjectId;
        requiredToComplete: boolean;
        minScore: number;
    };

    @Prop({ type: String, enum: LessonStatus, default: LessonStatus.DRAFT })
    status: LessonStatus;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);