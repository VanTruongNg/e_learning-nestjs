import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { UploadProcessor } from 'src/queue/processors/upload.processor';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
        name: 'upload',
        defaultJobOptions: {
            removeOnComplete: {
                age: 60,
                count: 100
            },
            removeOnFail: {
                age: 60 * 5
            },
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            }
        }
    }),
  ],
  providers: [CloudinaryService, UploadProcessor],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}