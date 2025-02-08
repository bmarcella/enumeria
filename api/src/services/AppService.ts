/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Request,
  Response,
} from 'express';


const services = {
  home: async (req: Request, res: Response) => {
    return res.send("Test");
  },

};
export default services;