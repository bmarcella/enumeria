import {
  Sender,
  Subject,
} from './Sender';

const MailService = {
  name: "Memploi",
  newUser : async (receiver: string, text: string,  req : any) => {
    try {
      const m = new Sender(MailService.name, req.mail);
      m.config(receiver, Subject.NEW_USER, text );
      return m.exec();
    } catch (error) {
      throw error;
    }
  
  },
  test : async ( req : any) => {
    const m = new Sender(MailService.name, req.mail);
    m.config("bmarcella91@gmail.com", Subject.NEW_USER, "Yes, the script should work on your local machine as long as you have the necessary packages installed and the correct configuration settings." );
    return await m.exec();
   },

   reset_password : async ( req : any, data: any) => {
    try {
      const m = new Sender(MailService.name, req.mail);
      const message = `Bonjour ${data.firstName}\n
      Nous avons reçu une demande de réinitialisation de votre mot de passe.  Voici le code validation de la réinitialisation :
      ${data.code}\n
      Si vous n'avez pas demandé la réinitialisation du mot de passe, veuillez ignorer cet e-mail.\n
      Cordialement,\n
      L'équipe Monkata Services`;
  
      m.config(data.email, Subject.FORGET_PASSWORD, message );
      return await m.exec();
    } catch (error) {
       console.log(error);
       return undefined
    }
 
   },
   reset_password_success : async ( req : any, data: any) => {
    try {
    const m = new Sender(MailService.name, req.mail);
    const message = `Bonjour ${data.firstName}\n
    Nous avons réinitialisé de votre mot de passe. \n
    L'équipe Monkata Services`;
    m.config(data.email, Subject.FORGET_PASSWORD, message );
    return await m.exec();
    } catch (error) {
      console.log(error);
      return undefined;
    }
    
   },
   
};
export default MailService;