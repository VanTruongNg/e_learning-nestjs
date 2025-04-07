import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";

export enum TransactionType {
    DEPOSIT = 'deposit',
    PURCHASE = 'purchase',
}

export enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

export enum PaymentMethod {
    PAYOS = 'payos',
    BALANCE = 'balance'
}

@Schema({
    timestamps: true,
})
export class Transaction extends Document {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true, enum: TransactionType })
    type: TransactionType;

    @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.PENDING })
    status: TransactionStatus;

    @Prop({ required: true, enum: PaymentMethod })
    paymentMethod: PaymentMethod;

    @Prop({ required: false })
    orderId?: string;

    @Prop({ required: false })
    description?: string;

    @Prop({ required: true, default: Date.now })
    createdAt: Date;

    @Prop({ type: Date, default: null })
    deletedAt?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);