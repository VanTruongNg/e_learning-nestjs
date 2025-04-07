import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Payment } from './schema/payment.schema';

@ApiTags('Payment')
@Controller('payments')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService
    ) {}

    @ApiOperation({ summary: 'Tạo URL thanh toán qua Payos' })
    @ApiResponse({ 
        status: 201, 
        description: 'Trả về URL thanh toán và orderCode',
        schema: {
            properties: {
                paymentUrl: { type: 'string' },
                orderCode: { type: 'string' }
            }
        }
    })
    @Post('create')
    @UseGuards(AuthGuard('jwt'))
    async createPayment(
        @Request() req,
        @Body() createPaymentDto: CreatePaymentDto
    ) {
        const userID = req.user.userId;
        return this.paymentService.createPaymentUrl(
            userID,
            createPaymentDto
        );
    }

    @ApiOperation({ summary: 'Lấy lịch sử thanh toán của người dùng' })
    @ApiResponse({ 
        status: 200, 
        description: 'Trả về danh sách các giao dịch thanh toán',
        type: [Payment]
    })
    @Get('history')
    @UseGuards(AuthGuard('jwt'))
    async getPaymentHistory(@Request() req) {
        const userID = req.user.userId;
        return this.paymentService.getPaymentHistory(userID);
    }

    @ApiOperation({ summary: 'Verify thanh toán khi redirect về từ Payos' })
    @ApiResponse({ 
        status: 200, 
        description: 'Trả về thông tin thanh toán đã verify',
        type: Payment
    })
    @Post('verify')
    @UseGuards(AuthGuard('jwt'))
    async verifyPayment(
        @Request() req,
        @Body() verifyPaymentDto: VerifyPaymentDto
    ) {
        const userID = req.user.userId;
        return this.paymentService.verifyPaymentByOrderCode(
            verifyPaymentDto.orderCode,
            userID
        );
    }
}