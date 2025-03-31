import { MailerModule } from '@nestjs-modules/mailer';
import { mailConfig } from './../config/mail.config';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
    imports: [
        ConfigModule.forFeature(mailConfig),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: configService.get('mail.host'),
                    port: configService.get('mail.port'),
                    secure: configService.get('mail.secure'),
                    auth: {
                        user: configService.get('mail.user'),
                        pass: configService.get('mail.pass'),
                    },
                },
                defaults: {
                    from: `"No Reply" <${configService.get('mail.user')}>`,
                },
                template: {
                    dir: join(__dirname, '..', 'mail', 'templates'), // đường dẫn tương đối từ thư mục dist
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MailService],
    exports: [MailService],
    controllers: []
})
export class MailModule {}
