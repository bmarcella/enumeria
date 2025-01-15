import express from 'express';
import * as jwt from 'jsonwebtoken';

import { protect } from '../../../../common/keycloak/AuthMiddleware';
import services from '../services/EntService';

export const adrRoute = express.Router();
const serv = services;
adrRoute.get('/getAll', protect(jwt, process.env.PUBLIC_KEY + ""), serv.getAll);
adrRoute.post('/add', protect(jwt, process.env.PUBLIC_KEY + ""), serv.add);