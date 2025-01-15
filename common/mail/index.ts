export class Mail {


  transporter: any;
  pass;
  nodemailer;
  sender: string ;
  constructor(nodemailer: any, email: string, pass: string) {
   this.nodemailer = nodemailer;
   this.sender = email+'@monkata.com';
   this.pass = pass;
   this.setTransporter();
  }

  private setTransporter(){
    try {
      this.transporter = this.nodemailer.createTransport({
        host: 'mail.monkata.com', // Replace with your SMTP server host
        port: 465, // Replace with your SMTP server port
        secure: true, // true for 465, false for other ports
        auth: {
            user:this.sender, // Replace with your email address
            pass: this.pass, // Replace with your email password
        },
        tls: {
          rejectUnauthorized: false,
      },
      logger: false, // Enable logging
      debug: false, // Enable debug output
    });
      
    } catch (error) {
      console.log(error);
    }
     
  }

  get(): any{
    return this.transporter;
  }

  getSender(): any{
    return this.sender;
  }

  
}