const allowedOrigins = [
  'http://localhost:5174/',
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
  credentials: true
};