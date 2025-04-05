import { Process, Processor } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Job } from "bull";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";

export interface UploadJob {
    file: Express.Multer.File;
    options?: {
        folder?: string;
        fileName?: string;
    };
} 

@Injectable()
@Processor("upload")
export class UploadProcessor {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Process({
        name: "media",
        concurrency: 10,
    })
    async handleMediaUpload(job: Job<UploadJob>) {
        try {
            const { file, options } = job.data;
            await this.cloudinaryService.uploadFile(file, options);
            
            // Xóa job sau khi hoàn thành
            await job.moveToCompleted();
            await job.remove();
            
        } catch (error) {
            // Đánh dấu job failed và xóa
            await job.moveToFailed({message: error.message});
            await job.remove();
            throw error;
        }
    }
}