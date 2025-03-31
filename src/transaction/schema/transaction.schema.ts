import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { timestamp } from "rxjs";

export enum TransactionType {
    DEPOSIT = 'deposit',
    PURCHASE = 'purchase',
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

    @Prop({ required: true, default: Date.now })
    createdAt: Date;

    @Prop({ type: Date, default: null })
    deletedAt?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);