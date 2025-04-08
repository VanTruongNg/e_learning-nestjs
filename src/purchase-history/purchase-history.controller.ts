import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionService } from './purchase-history.service';
import { PurchaseCourseDto, RefundPurchaseDto } from './dto/purchase-course.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/schema/user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('purchase-history')
@UseGuards(AuthGuard('jwt'))
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Post('purchase')
    async purchaseCourse(
        @Req() req,
        @Body() purchaseDto: PurchaseCourseDto
    ) {
        const user = req.user.userId
        return this.transactionService.purchaseCourse(
            user,
            purchaseDto.courseId
        );
    }

    @Post('refund/:purchaseId')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    async refundPurchase(
        @Param('purchaseId') purchaseId: string,
        @Body() refundDto: RefundPurchaseDto
    ) {
        return this.transactionService.refundPurchase(
            purchaseId,
            refundDto.reason
        );
    }
}
