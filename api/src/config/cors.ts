/* eslint-disable @typescript-eslint/no-explicit-any */
export const corsConfig  = {
    allowedOrigins : ['http://localhost:5174/'],
    corsOptions : {
    origin:  (origin: any , callback: any) => {
    if (!origin || corsConfig.allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
    } else {
      if(Number(process.env.DEV+"") == 0 )  
        callback(null, true);
      else
       callback(new Error('Not allowed by CORS'));
    }
    },
    credentials: true
  }
}