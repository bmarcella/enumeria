import { Mail } from ".";

export enum Subject {
  NEW_USER = "Bienvenue",
  FORGET_PASSWORD = "Réinitialisez votre mot de passe de Memploi.com",
}

export class Sender {
  mailOptions: any;

  constructor(
    private name: any,
    private mail: Mail
  ) {}

  config(receiver: any, sub: Subject, text: any, html: boolean = false) {
    const from = '"' + this.name + '" <' + this.mail.getSender() + ">";
    if (!html) {
      this.mailOptions = {
        from, // Sender address
        to: receiver, // List of recipients
        subject: sub, // Subject line
        text: text, // Plain text body
        headers: {
          "Reply-To": this.mail.getSender(),
        },
      };
    } else {
      this.mailOptions = {
        from, // Sender address
        to: receiver, // List of recipients
        subject: sub, // Subject line
        html: text, // HTML body
        headers: {
          "Reply-To": this.mail.getSender(),
        },
      };
    }
  }

  exec(): Promise<any> {
    return new Promise((r, e) => {
      try {
        this.mail.get().sendMail(this.mailOptions, (error: any, info: any) => {
          if (error) {
            console.error(error);
            return e(error);
          }
          console.log("Message sent: %s", info.messageId, this.mailOptions);
          // console.log('Preview URL: %s', this.mail.get().getTestMessageUrl(info));
          return r(info);
        });
      } catch (error) {
        e(error);
      }
    });
  }
}
