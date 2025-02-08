import express from 'express';
import * as jwt from 'jsonwebtoken';

import { protect } from '../../../common/keycloak/AuthMiddleware';
import _serv from '../services/AppService';

export const userRoute = express.Router();

userRoute.get('/get', protect(jwt, process.env.KEYCLOAK_PUBLIC_KEY + ""), _serv.home);


