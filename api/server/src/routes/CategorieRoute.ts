import express from 'express';
import * as jwt from 'jsonwebtoken';

import { protect } from '../../../../common/keycloak/AuthMiddleware';
import _ctrl from '../controller/CategorieController';

export const catRoute = express.Router();
const ctrl = _ctrl.init();
catRoute.post('/add',protect(jwt, process.env.PUBLIC_KEY + ""), ctrl.add);
catRoute.get('/show', ctrl.show);
catRoute.get('/listByTypeCat/:name', ctrl.listByTypeCat);
// catRoute.get('/show', ctrl.show);
catRoute.delete('/delete/:id',protect(jwt, process.env.PUBLIC_KEY + ""), ctrl.del);
catRoute.get('', ctrl.home);