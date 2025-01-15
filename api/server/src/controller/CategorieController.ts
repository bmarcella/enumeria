import {
  Request,
  Response,
} from 'express';

import BaseController from '../../../../common/mvc/BaseController';
import CategorieService from '../services/CategorieService';

export default class CategorieController extends BaseController {

 static _me : CategorieController;

 constructor() {
     super();
 }

 public static init() {
  if (this._me==undefined) {
     this._me = new CategorieController();
  }
  return this._me;
 }

 public add (req: Request, res: Response) {
   return CategorieService.home(req, res);
 }

public show (req: Request, res: Response) {
  return CategorieService.list(req, res);
}

public del (req: Request, res: Response) {
  return CategorieService.del(req, res);
}

public home (req: Request, res: Response) {
  return CategorieService.home(req, res);
}

public listByTypeCat (req: Request, res: Response) {
  return CategorieService.listByTypeCat(req, res);
}



}