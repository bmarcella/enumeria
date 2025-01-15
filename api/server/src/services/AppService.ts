
import { Request, Response } from "express";

const services = {
  home : async (req: Request, res: Response) => {
    res.send({ 
      service_name : process.env.SERVICE_NAME,
      port: process.env.PORT
    });
  }
};
export default services;
