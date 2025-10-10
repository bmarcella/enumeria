import express from 'express';
// import * as jwt from 'jsonwebtoken';

// import { protect } from '../../../common/keycloak/AuthMiddleware';
import _serv from '../services/AppService';

export const userRoute = express.Router();

userRoute.get('/get', _serv.home);
userRoute.post('/chat', _serv.chat);


