import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PurchaseStatus {
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

@Schema({
    timestamps: true
})
export class PurchaseHistory extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ required: true })
    amount: number;

    @Prop({ type: String, enum: PurchaseStatus })
    status: PurchaseStatus;

    @Prop()
    failureReason?: string;

    @Prop({ default: false })
    isRefunded: boolean;

    @Prop()
    refundReason?: string;

    @Prop({ default: false }) 
    isDeleted: boolean;
}

export const PurchaseHistorySchema = SchemaFactory.createForClass(PurchaseHistory);