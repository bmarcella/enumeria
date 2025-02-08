import { Http } from '../index/Http';

export enum Subject {
  NEW_USER = "Bienvenue",
  FORGET_PASSWORD = "Réinitialisez votre mot de passe de Memploi.com",
}




export class SenderApi {
http:  Http;
endPoint: string;

constructor(axios: any, ep: string, private formData: any ) {
    this.http = new Http(axios, "");
    this.endPoint = ep;
}
  








  
}