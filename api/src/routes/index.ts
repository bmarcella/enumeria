import express from 'express';
import { userRoute } from './AppRoute';

export const routes = express.Router();

routes.use('/app', userRoute);