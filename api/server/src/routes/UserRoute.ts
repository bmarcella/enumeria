import axios from 'axios';
import express from 'express';
import * as jwt from 'jsonwebtoken';

import { ReCaptcha } from '../../../../common/index/ReCaptcha';
import { protect } from '../../../../common/keycloak/AuthMiddleware';
import _ctrl from '../controller/UserController';
import services from '../services/UserService';

export const userRoute = express.Router();
const ctrl = _ctrl.init();
const serv = services;
userRoute.get('/', ctrl.home);
userRoute.post('/login', ctrl.login);
userRoute.post('/login/:token', ctrl.login);
userRoute.post('/register', ReCaptcha(axios), ctrl.register);
userRoute.post('/register/:token', ReCaptcha(axios), ctrl.register);
userRoute.get('/logout/:token', protect(jwt, process.env.PUBLIC_KEY + ""), ctrl.logout);
userRoute.get('/refreshtoken/:token', ctrl.refreshtoken);
userRoute.get('/avatar/:id', ctrl.avatar);
userRoute.get('/userProfil', protect(jwt, process.env.PUBLIC_KEY + ""), ctrl.userProfil);
userRoute.post('/editPassword', protect(jwt, process.env.PUBLIC_KEY + ""), serv.editPassword);
userRoute.post('/resetPassword', serv.resetPassword);
userRoute.post('/resetNowPassword', serv.resetNowPassword);
userRoute.get('/getCrossToken/:token', serv.getCrossTokenForAdmin);
userRoute.get('/getCrossFreeToken/:token', serv.getCrossToken);
userRoute.get('/approveUser/:code', protect(jwt, process.env.PUBLIC_KEY + ""), serv.approveUser);

// PAGINATION

userRoute.post('/getUserByPage/:page',protect(jwt, process.env.PUBLIC_KEY + ""), serv.getUserByPage);

userRoute.get('/getStats',protect(jwt, process.env.PUBLIC_KEY + ""), serv.getStats);
