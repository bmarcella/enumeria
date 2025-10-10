const allowedOrigins = [
  'https://auth.monkata.com',
  'https://console.monkata.com',
  'https://monkata.com',
  'https://www.monkata.com',
  'https://memploi.com',
  'https://www.memploi.com',
  'https://pledika.com',
  'https://www.pledika.com',
  // Ajoutez d'autres domaines frontend ici
];

export const corsOptions = {
  origin:  (origin: any, callback: any) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      if(Number(process.env.DEV+"") == 0 )  
        callback(null, true);
      else
       callback(new Error('Not allowed by CORS'));
    }
  },
};