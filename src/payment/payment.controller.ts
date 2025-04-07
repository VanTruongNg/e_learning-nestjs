import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

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
        const { userID } = req.user
        return this.paymentService.createPaymentUrl(
            userID,
            createPaymentDto
        );
    }
}