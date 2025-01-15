import axios from 'axios';
import express from 'express';
import * as jwt from 'jsonwebtoken';

import { ReCaptcha } from '../../../../common/index/ReCaptcha';
import { protect, protectEnt } from '../../../../common/keycloak/AuthMiddleware';
import services from '../services/EntService';

export const entRoute = express.Router();
const serv = services;
entRoute.get('/getAll', protect(jwt, process.env.PUBLIC_KEY + ""), serv.getAll);
entRoute.post('/add', [protect(jwt, process.env.PUBLIC_KEY + ""),  ReCaptcha(axios) ], serv.add);
entRoute.get('/getAllWithAdress', protect(jwt, process.env.PUBLIC_KEY + ""), serv.getAllWithAdress);
entRoute.get('/getById/:id',serv.getById);
entRoute.post('/getListById',serv.getListById);
entRoute.get('/getAllWithAdressPage', protect(jwt, process.env.PUBLIC_KEY + ""), serv.getAllWithAdressPage);

// ENTREPRISE
entRoute.delete('/del/:id',serv.delete);

// ADRESSE
entRoute.post('/addAdresse/:id',serv.addAdresse);
entRoute.post('/editAdresse/:id',serv.editAdresse);

// ENT
entRoute.post('/edit/:id', protect(jwt, process.env.PUBLIC_KEY + ""), serv.edit);

// ENT
entRoute.get('/count/:id', serv.count);
entRoute.get('/adresse/count/:id', serv.countAdresse);
// ENT 
entRoute.post('/getEntByPage/:page',protect(jwt, process.env.PUBLIC_KEY + ""), serv.getEntByPage);
entRoute.get('/approve/:state/:id',protect(jwt, process.env.PUBLIC_KEY + ""), serv.setApprove);

entRoute.post('/addEntApp', protect(jwt, process.env.PUBLIC_KEY + ""), serv.addEntApp);
entRoute.get('/loginEnt/:idEnt/:appName', protect(jwt, process.env.PUBLIC_KEY + ""), serv.loginEnt);

entRoute.get('/get', [ protect(jwt, process.env.PUBLIC_KEY + ""), protectEnt(jwt, process.env.PUBLIC_KEY + "")], serv.getByIdSec);
entRoute.get('/count', [ protect(jwt, process.env.PUBLIC_KEY + ""), protectEnt(jwt, process.env.PUBLIC_KEY + "")], serv.countEnt);