import {
  Request,
  Response,
} from 'express';

import BaseController from '../../../../common/mvc/BaseController';
import UserService from '../services/UserService';

export default class EntrepriseController extends BaseController {
  static _me : EntrepriseController;

  constructor() {
     super();
 }
 public static init() {
  if (this._me==undefined) {
     this._me = new EntrepriseController();
  }
  return this._me;
 }

 public home (req: Request, res: Response) {
   return UserService.home(req, res);
 }

}