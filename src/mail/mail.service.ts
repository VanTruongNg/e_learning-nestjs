import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SendMailJob } from '../queue/processors/mail.processor';

@Injectable()
export class MailService {
    constructor(
        @InjectQueue('mail') private readonly mailQueue: Queue<SendMailJob>,
        private mailerService: MailerService,
        private configService: ConfigService,
    ) {}

    async sendVerificationEmail(
        to: string,
        data: { name: string; token: string }
    ): Promise<boolean> {
        try {
            await this.mailQueue.add('send', {
                to,
                subject: 'Xác thực tài khoản',
                template: 'verification',
                context: {
                    name: data.name,
                    token: data.token,
                },
            });
            return true;
        } catch (error) {
            console.error('Add mail to queue error:', error);
            return false;
        }
    }

    async sendResetPasswordEmail(
        to: string,
        data: { name: string; token: string }
    ): Promise<boolean> {
        try {
            await this.mailQueue.add('send', {
                to,
                subject: 'Đặt lại mật khẩu',
                template: 'reset-password',
                context: {
                    name: data.name,
                    token: data.token,
                },
            });
            return true;
        } catch (error) {
            console.error('Add mail to queue error:', error);
            return false;
        }
    }
}