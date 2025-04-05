import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';
import { MailProcessor } from 'src/queue/processors/mail.processor';

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: configService.get('SMTP_HOST'),
                    port: configService.get('SMTP_PORT'),
                    secure: configService.get('SMTP_SECURE'),
                    auth: {
                        user: configService.get('SMTP_USER'),
                        pass: configService.get('SMTP_PASSWORD'),
                    },
                },
                defaults: {
                    from: `"No Reply" <${configService.get('SMTP_USER')}>`,
                },
                template: {
                    dir: join(__dirname, 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: 'mail',
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
    providers: [MailService, MailProcessor],
    exports: [MailService],
    controllers: []
})
export class MailModule {}
