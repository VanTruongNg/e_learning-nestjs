import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
    @ApiProperty({
        description: 'Số tiền cần nạp (VND)',
        example: 100000,
        minimum: 5000,
        type: Number
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @Min(5000)
    amount: number;
}