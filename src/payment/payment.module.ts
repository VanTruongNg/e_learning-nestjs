import { Module } from '@nestjs/common';
import { TransactionModule } from '../purchase-history/purchase-history.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schema/payment.schema';

@Module({
  imports: [
    ConfigModule,
    TransactionModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema }
    ])
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule {}