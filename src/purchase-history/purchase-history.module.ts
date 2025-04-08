import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionController } from './purchase-history.controller';
import { TransactionService } from './purchase-history.service';
import { PurchaseHistory, PurchaseHistorySchema } from './schema/purchase-history.schema';
import { User, UserSchema } from '../auth/schema/user.schema';
import { Course, CourseSchema } from '../course/schema/course.schema';
import { AuthModule } from 'src/auth/auth.module';
import { CourseModule } from 'src/course/course.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PurchaseHistory.name, schema: PurchaseHistorySchema },
        ]),
        AuthModule,
        CourseModule,
    ],
    controllers: [TransactionController],
    providers: [TransactionService],
    exports: [TransactionService, MongooseModule]
})
export class TransactionModule {}
