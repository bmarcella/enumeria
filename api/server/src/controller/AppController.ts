import {
  Request,
  Response,
} from 'express';

import BaseController from '../../../../common/mvc/BaseController';
import cService from '../services/AppService';

export default class AppController extends BaseController {

 static _me : AppController;

 constructor() {
     super();
 }

 public static init() {
  if (this._me==undefined) {
     this._me = new AppController();
  }
  return this._me;
 }


public home (req: Request, res: Response) {
  return cService.home(req, res);
}

}