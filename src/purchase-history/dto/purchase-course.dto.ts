import { IsNotEmpty, IsString } from 'class-validator';

export class PurchaseCourseDto {
    @IsNotEmpty({ message: 'CourseId không được để trống' })
    @IsString({ message: 'CourseId phải là string' })
    courseId: string;
}

export class RefundPurchaseDto {
    @IsNotEmpty({ message: 'Lý do hoàn tiền không được để trống' })
    @IsString({ message: 'Lý do hoàn tiền phải là string' })
    reason: string;
}