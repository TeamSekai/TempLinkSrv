// @deno-types="npm:@types/express@4.17.21"
import { Router } from 'express';
import * as express from 'express';

import { authenticationMiddleware } from '../authentication/authenticationMiddleware.ts';
import { requireLinkRequest } from './LinkAPI.ts';
import { LinkAPI } from './LinkAPI.ts';
import { ClientError } from './errors.ts';
import { ServerConsole } from '../server/ServerConsole.ts';

export const apiRouter = Router();

apiRouter.use(authenticationMiddleware);
apiRouter.use(express.json());

apiRouter.post('/links', async (req, res) => {
    try {
        ServerConsole.instance.log(req.body);
        const request = requireLinkRequest(req.body);
        const response = await LinkAPI.instance.create(request);
        res.status(201).send(JSON.stringify(response));
    } catch (e) {
        if (e instanceof ClientError) {
            res.status(400).send({
                type: 'error',
                description: e.clientMessage,
            });
        } else {
            ServerConsole.instance.error(e);
        }
    }
});
