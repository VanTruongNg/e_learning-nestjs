import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bull";
import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from 'cloudinary';
import { CloudinaryResponse } from "./interfaces/cloudinary-response.interface";

@Injectable()
export class CloudinaryService {
    private readonly cloudName: string;

    constructor(
        private configService: ConfigService,
        @InjectQueue('upload') private readonly uploadQueue: Queue
    ) {
        this.cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        cloudinary.config({
            cloud_name: this.cloudName,
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }

    private predictCloudinaryUrl(folder: string, fileName: string): string {
        return `https://res.cloudinary.com/${this.cloudName}/image/upload/v1/${folder}/${fileName}`;
    }

    async uploadFileAsync(
        file: Express.Multer.File,
        options?: {
          folder?: string;
          fileName?: string;
        }
    ): Promise<string> {
        await this.uploadQueue.add('media', {
          file,
          options,
        });
    
        const fileName = options?.fileName || file.originalname;
        const folder = options?.folder || '';
        return this.predictCloudinaryUrl(folder, fileName);
    }

    async uploadFile(
        file: Express.Multer.File,
        options?: {
            folder?: string;
            fileName?: string;
        }
    ): Promise<CloudinaryResponse> {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
    
        const uploadOptions: UploadApiOptions = {
            resource_type: 'auto' as 'auto',
            ...(options?.folder && { folder: options.folder }),
            ...(options?.fileName && {
                public_id: options.fileName,
                unique_filename: false
            })
        };
    
        try {
            const result: UploadApiResponse = await cloudinary.uploader.upload(
                dataURI,
                uploadOptions
            );
            
            return {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
                originalFilename: file.originalname,
            };
        } catch (error) {
            throw new Error(`Không thể upload file: ${error.message}`);
        }
    }

    async deleteFile(publicId: string): Promise<boolean> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result.result === 'ok';
        } catch (error) {
            throw new Error(`Không thể xóa file: ${error.message}`);
        }
    }
}