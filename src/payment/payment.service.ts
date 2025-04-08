import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from './schema/payment.schema';
import { User, UserDocument } from '../auth/schema/user.schema';
const PayOS = require('@payos/node');

@Injectable()
export class PaymentService {
    private payos: any;

    constructor(
        private configService: ConfigService,
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) {
        // Khởi tạo PayOS instance
        this.payos = new PayOS(
            this.configService.get('PAYOS_CLIENT_ID'),
            this.configService.get('PAYOS_API_KEY'),
            this.configService.get('PAYOS_CHECKSUM_KEY'),
        );
    }

    async createPaymentUrl(userId: string, dto: CreatePaymentDto) {
        const { amount } = dto;
        
        const orderCode = Math.floor(100000 + Math.random() * 900000);

        const paymentData = {
            orderCode,
            amount,
            description: `Nạp tiền #${orderCode}`,
            cancelUrl: this.configService.get('FRONTEND_CANCEL_URL'),
            returnUrl: this.configService.get('FRONTEND_RETURN_URL'),
            returnData: JSON.stringify({ userId, amount }),
        };

        try {
            const response = await this.payos.createPaymentLink(paymentData);

            // Lưu thông tin thanh toán vào database
            const payment = new this.paymentModel({
                userId,
                amount,
                orderCode,
                status: PaymentStatus.PENDING,
                paymentUrl: response.checkoutUrl
            });
            await payment.save();

            return {
                paymentUrl: response.checkoutUrl,
                orderCode: orderCode
            };
        } catch (error) {
            console.error('PayOS createPaymentLink error:', error);
            throw error;
        }
    }

    async verifyPaymentHook(signature: string, data: any): Promise<boolean> {
        const isValid = this.payos.verifyPaymentWebhookData(signature, data);
        
        if (isValid) {
            // Cập nhật trạng thái thanh toán trong database
            const orderCode = data.orderCode;
            const status = data.status === 'PAID' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
            
            await this.paymentModel.findOneAndUpdate(
                { orderCode },
                { status },
                { new: true }
            );
        }
        
        return isValid;
    }

    // Quy đổi tiền VND sang balance (1000 VND = 1 balance)
    private convertToBalance(amount: number): number {
        return Math.floor(amount / 1000);
    }

    async verifyPaymentByOrderCode(orderCode: number, userId: string): Promise<Payment> {
        try {
            // Kiểm tra trạng thái thanh toán với Payos
            const paymentStatus = await this.payos.getPaymentLinkInformation(orderCode);
            
            const status = paymentStatus.status === 'PAID'
                ? PaymentStatus.SUCCESS
                : PaymentStatus.FAILED;

            const payment = await this.paymentModel.findOneAndUpdate(
                { orderCode },
                { status },
                { new: true }
            );

            if (status === PaymentStatus.SUCCESS) {
                const balanceToAdd = this.convertToBalance(paymentStatus.amount);
                await this.userModel.findByIdAndUpdate(
                    userId,
                    { $inc: { balance: balanceToAdd } }
                );
            }

            return payment;
        } catch (error) {
            console.error('Verify payment error:', error);
            throw error;
        }
    }

    async getPaymentHistory(userId: string): Promise<Payment[]> {
        return this.paymentModel.find({ userId }).sort({ createdAt: -1 });
    }
}