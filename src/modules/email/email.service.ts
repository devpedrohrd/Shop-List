import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async send(emailOptions: {
    to: string
    subject: string
    html: string
  }): Promise<void> {
    const { to, subject, html } = emailOptions

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html,
      })
      console.log(`Email sent successfully to ${to}`)
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error)
      throw new Error('Email sending failed')
    }
  }
}
