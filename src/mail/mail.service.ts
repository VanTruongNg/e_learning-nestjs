import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        private configService: ConfigService,
    ) {}

    async sendVerificationEmail(
        to: string,
        data: { name: string; token: string }
    ): Promise<boolean> {
        try {
            await this.mailerService.sendMail({
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
            console.error('Send mail error:', error);
            return false;
        }
    }

    async sendResetPasswordEmail(
        to: string,
        data: { name: string; token: string }
    ): Promise<boolean> {
        try {
            await this.mailerService.sendMail({
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
            console.error('Send mail error:', error);
            return false;
        }
    }
}