import { nodemailerConfig } from "@providers/index";
import { env } from "@config/env";
import { EmailOptions } from "@providers/notification/types/email";


 class MailService {
  public async sendMail(mailOptions: EmailOptions): Promise<void> {
    try {
      const mailBody = {
        from: env.MAIL_USER,
        to: mailOptions.to,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
      };
      await nodemailerConfig.sendMail(mailBody);
    } catch (error) {
    console.error(`unable to send email to ${mailOptions.to}:`, error);  
    }
  }
}

export default MailService;
