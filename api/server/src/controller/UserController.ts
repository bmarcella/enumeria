import {
  Request,
  Response,
} from 'express';

import BaseController from '../../../../common/mvc/BaseController';
import UserService from '../services/UserService';

export default class UserController extends BaseController {

  static _me: UserController;
  constructor() {
    super();
  }
  public static init() {
    if (this._me == undefined) {
      this._me = new UserController();
    }
    return this._me;
  }

  public home(req: Request, res: Response) {
     return UserService.home(req, res);
  }

  public profil(req: Request, res: Response) {
    return UserService.home(req, res);
  }

  public login(req: Request, res: Response) {
    return UserService.login(req, res);
  }

  public logout(req: Request, res: Response) {
    return UserService.logout(req, res);
  }

  public register(req: Request, res: Response) {
    return UserService.register(req, res);
  }
  
  public refreshtoken(req: Request, res: Response) {
    return UserService.refreshtoken(req, res);
  }

  public avatar(req: Request, res: Response) {
    return UserService.avatar(req, res);
  }

  userProfil(req: Request, res: Response) {
    return UserService.userProfil(req, res);
  }

}