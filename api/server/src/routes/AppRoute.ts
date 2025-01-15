import express from 'express';
import * as jwt from 'jsonwebtoken';

import { protect } from '../../../../common/keycloak/AuthMiddleware';
import _ctrl from '../controller/AppController';

export const appRoute = express.Router();
const ctrl = _ctrl.init();
appRoute.get('/', ctrl.home);
appRoute.get('/logout/:token', protect(jwt, process.env.PUBLIC_KEY + ""), ctrl.home);
