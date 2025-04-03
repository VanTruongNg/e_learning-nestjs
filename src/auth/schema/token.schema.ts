import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TokenDocument = Token & Document;

export enum TokenType {
    VERIFICATION = 'verification',
    RESET_PASSWORD = 'reset_password'
}

@Schema({
    timestamps: true,
})
export class Token extends Document {
    @Prop({ required: true })
    token: string;

    @Prop({ required: true, enum: TokenType })
    type: TokenType;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: true, default: false })
    isUsed: boolean;

    @Prop({ type: Date, default: null })
    deletedAt?: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);