import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum CourseLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced'
}

@Schema({
    timestamps: true,
})
export class Course extends Document {
    @Prop({ required: true, index: true })
    title: string;

    @Prop({ required: false })
    description: string;

    @Prop({ required: true })
    price: number;

    @Prop({ required: false, nullable: true })
    thumbnailUrl: string;

    @Prop({ type: String, enum: CourseLevel, default: CourseLevel.BEGINNER })
    level: CourseLevel;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Lesson' }], default: [] })
    lessons: Types.ObjectId[];

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Number, default: 0 })
    enrolledStudents: number;

    @Prop({ type: Number, min: 0, max: 5, default: 0 })
    averageRating: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);