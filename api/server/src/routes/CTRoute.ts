import express from 'express';

import * as jwt from 'jsonwebtoken';
import { protect } from '../../../../common/keycloak/AuthMiddleware';
import services from '../services/CTService';

export const ctRoute = express.Router();
const serv = services;
ctRoute.get('/addCT/:key', serv.addCT);
ctRoute.post('/addCT/:key', serv.addCT);
ctRoute.get('/getCT/:token', serv.getCT);
ctRoute.post('/setCT', serv.setRefreshTokenCT);
ctRoute.get('/getFullCT/:token', serv.getFullCT);


ctRoute.get('/directLoginCT/:app',protect(jwt, process.env.PUBLIC_KEY + ""), serv.directLoginCT);
