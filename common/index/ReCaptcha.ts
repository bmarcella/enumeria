const secretKey: string = "6LcthfgpAAAAAHm4BoLhhuCmEUbOrvekB1c2JXyA"; 
export const ReCaptcha  =   (axios: any) => {
  return async (req: any, res: any, next: any) => {
    const token = req.body.tokenRC;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    try {
      const response = await axios.post(url);
      if (response.data.success) {
        console.log("reCAPTCHA verified successfully!");
        next();
      } else {
        res.status(500).send({ message: 'reCAPTCHA verification failed. Please try again.'} );
      }
    } catch (error) {
      res.status(500).send({ message:  'Error verifying reCAPTCHA.'});
    }
  }
}