import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

// Định nghĩa trạng thái thanh toán
export enum PaymentStatus {
  PENDING = 'pending', // Đang chờ thanh toán
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, unique: true })
  orderCode: number;

  @Prop({ 
    type: String, 
    enum: PaymentStatus, 
    default: PaymentStatus.PENDING 
  })
  status: PaymentStatus;

  @Prop()
  createdAt: Date;

  @Prop() 
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);