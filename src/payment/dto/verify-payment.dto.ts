import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class VerifyPaymentDto {
    @ApiProperty({
        description: 'Mã giao dịch từ Payos',
        example: 123456
    })
    @IsNotEmpty()
    @IsNumber()
    orderCode: number;
}