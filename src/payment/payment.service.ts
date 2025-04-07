import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto';
const PayOS = require('@payos/node');

@Injectable()
export class PaymentService {
    private payos: any;

    constructor(
        private configService: ConfigService,
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
        
        // Tạo orderCode là số ngẫu nhiên 6 chữ số
        const orderCode = Math.floor(100000 + Math.random() * 900000);

        // Tạo payment request sử dụng PayOS SDK
        const paymentData = {
            orderCode,
            amount,
            description: `Nạp tiền #${orderCode}`, // Giới hạn 25 ký tự
            cancelUrl: this.configService.get('FRONTEND_CANCEL_URL'),
            returnUrl: this.configService.get('FRONTEND_RETURN_URL'),
            returnData: JSON.stringify({ userId, amount }),
        };

        try {
            // Gọi createPaymentLink từ PayOS SDK
            const response = await this.payos.createPaymentLink(paymentData);

            // Trả về payment URL
            return {
                paymentUrl: response.checkoutUrl,
                orderCode: orderCode
            };
        } catch (error) {
            console.error('PayOS createPaymentLink error:', error);
            throw error;
        }
    }

    // Verify webhook signature
    verifyPaymentHook(signature: string, data: any): boolean {
        return this.payos.verifyPaymentWebhookData(signature, data);
    }
}