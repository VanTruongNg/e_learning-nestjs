import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum CourseLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced'
}

export type CourseDocument = Course & Document;

@Schema({
    timestamps: true,
})
export class Course extends Document {
    @Prop({ required: true, index: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    price: number;

    @Prop({ type: String, enum: CourseLevel, default: CourseLevel.BEGINNER })
    level: CourseLevel;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Number, default: 0 })
    enrolledStudents: number;

    @Prop({ type: Number, min: 0, max: 5, default: 0 })
    averageRating: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);