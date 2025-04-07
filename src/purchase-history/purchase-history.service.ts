import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../auth/schema/user.schema';
import { Course } from '../course/schema/course.schema';
import { PurchaseHistory, PurchaseStatus } from './schema/purchase-history.schema';

@Injectable()
export class TransactionService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Course.name) private courseModel: Model<Course>,
        @InjectModel(PurchaseHistory.name) private purchaseHistoryModel: Model<PurchaseHistory>
    ) {}

    async purchaseCourse(userId: string, courseId: string): Promise<PurchaseHistory> {
        const [user, course] = await Promise.all([
            this.userModel.findById(userId),
            this.courseModel.findById(courseId)
        ]);

        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        if (!course) {
            throw new NotFoundException('Khoá học không tồn tại');
        }

        if (user.boughtCourses.includes(new Types.ObjectId(courseId))) {
            throw new BadRequestException('Bạn đã mua khoá học này rồi');
        }

        if (user.balance < course.price) {
            throw new BadRequestException('Số dư không đủ để mua khoá học này');
        }

        const purchase = new this.purchaseHistoryModel({
            userId: new Types.ObjectId(userId),
            courseId: new Types.ObjectId(courseId),
            amount: course.price,
            status: PurchaseStatus.COMPLETED
        });

        try {
            await purchase.save();

            await this.userModel.findByIdAndUpdate(userId, {
                $inc: { balance: -course.price },
                $push: { boughtCourses: new Types.ObjectId(courseId) }
            });

            return purchase;
        } catch (error) {
            purchase.status = PurchaseStatus.FAILED;
            purchase.failureReason = error.message;
            await purchase.save();
            throw error;
        }
    }

    async refundPurchase(purchaseId: string, reason: string): Promise<PurchaseHistory> {
        const purchase = await this.purchaseHistoryModel.findById(purchaseId);
        
        if (!purchase) {
            throw new NotFoundException('Không tìm thấy giao dịch');
        }

        if (purchase.status !== PurchaseStatus.COMPLETED) {
            throw new BadRequestException('Chỉ có thể hoàn tiền cho giao dịch đã hoàn thành');
        }

        if (purchase.isRefunded) {
            throw new BadRequestException('Giao dịch này đã được hoàn tiền');
        }

        try {
            // Hoàn tiền cho user
            await this.userModel.findByIdAndUpdate(purchase.userId, {
                $inc: { balance: purchase.amount }
            });

            // Remove course from user's boughtCourses
            await this.userModel.findByIdAndUpdate(purchase.userId, {
                $pull: { boughtCourses: purchase.courseId }
            });

            // Update purchase record
            purchase.isRefunded = true;
            purchase.refundReason = reason;
            purchase.status = PurchaseStatus.REFUNDED;
            await purchase.save();

            return purchase;
        } catch (error) {
            throw new Error(`Lỗi khi hoàn tiền: ${error.message}`);
        }
    }

    async getPurchaseHistory(userId: string): Promise<PurchaseHistory[]> {
        const purchases = await this.purchaseHistoryModel.find({ 
            userId: new Types.ObjectId(userId),
            isDeleted: false 
        })
        .populate('courseId', 'name price')
        .sort({ createdAt: -1 })
        .exec();

        return purchases;
    }
}
