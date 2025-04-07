import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum LectureType {
    TEXT = 'text',
    VIDEO = 'video',
    MIXED = 'mixed'
}

@Schema({
    timestamps: true,
})
export class Lecture extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ type: String, enum: LectureType, default: LectureType.TEXT })
    type: LectureType;

    @Prop({ type: Number, required: true })
    order: number;

    @Prop({
        type: {
            text: { type: String },
            videoUrl: { type: String },
            duration: { type: Number }
        },
        _id: false
    })
    content: {
        text?: string;
        videoUrl?: string;
        duration?: number;
    };

    @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true, index: true })
    lessonId: Types.ObjectId;

    @Prop({
        type: {
            isEnabled: { type: Boolean, default: false },
            quizId: { type: Types.ObjectId, ref: 'Quiz' },
            requiredToComplete: { type: Boolean, default: true },
            minScore: { type: Number, default: 70 }
        },
        _id: false
    })
    endQuiz?: {
        isEnabled: boolean;
        quizId?: Types.ObjectId;
        requiredToComplete: boolean;
        minScore: number;
    };

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;
}

export const LectureSchema = SchemaFactory.createForClass(Lecture);