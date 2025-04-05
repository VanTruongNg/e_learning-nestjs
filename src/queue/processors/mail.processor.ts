import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

export interface SendMailJob {
  to: string;
  subject: string;
  template: string;
  context: any;
}

@Injectable()
@Processor('mail')
export class MailProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process('send')
  async handleSendMail(job: Job<SendMailJob>) {
    const { to, subject, template, context } = job.data;
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
      return true;
    } catch (error) {
      console.error('Send mail error in queue:', error);
      throw error;
    }
  }
} 