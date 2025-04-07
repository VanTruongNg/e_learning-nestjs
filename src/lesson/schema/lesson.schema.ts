import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({
    timestamps: true,
})
export class Lesson extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ type: Number, required: true })
    order: number;

    @Prop([{ type: Types.ObjectId, ref: 'Lecture' }, { default: [] }])
    lectures: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
    courseId: Types.ObjectId;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Number, default: 0 })
    totalDuration: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);