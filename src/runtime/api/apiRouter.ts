import { Router } from 'express';
import { authenticationMiddleware } from '../authentication/authenticationMiddleware.ts';

export const apiRouter = Router();

apiRouter.use(authenticationMiddleware);
