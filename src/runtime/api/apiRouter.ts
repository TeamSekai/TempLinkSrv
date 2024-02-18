// @deno-types="npm:@types/express@4.17.21"
import { Request, Response, Router } from 'express';
import * as express from 'express';

import { authenticationMiddleware } from '../authentication/authenticationMiddleware.ts';
import { requireLinkRequest } from './LinkAPI.ts';
import { LinkAPI } from './LinkAPI.ts';
import { ClientError } from './errors.ts';
import { ServerConsole } from '../server/ServerConsole.ts';

export const apiRouter = Router();

apiRouter.use(authenticationMiddleware);
apiRouter.use(express.json());

function wrapError(handler: (req: Request, res: Response) => Promise<void>) {
    return async (req: Request, res: Response) => {
        try {
            await handler(req, res);
        } catch (e) {
            if (e instanceof ClientError) {
                res.status(e.status).send({
                    type: 'error',
                    description: e.clientMessage,
                });
            } else {
                ServerConsole.instance.error(e);
            }
        }
    };
}

apiRouter.post(
    '/links',
    wrapError(async (req, res) => {
        const request = requireLinkRequest(req.body);
        const response = await LinkAPI.instance.create(request);
        res.status(201).send(JSON.stringify(response));
    }),
);

apiRouter.get(
    '/links/:linkId',
    wrapError(async (req, res) => {
        const response = await LinkAPI.instance.get(req.params.linkId);
        res.status(200).send(JSON.stringify(response));
    }),
);

apiRouter.delete(
    '/links/:linkId',
    wrapError(async (req, res) => {
        await LinkAPI.instance.delete(req.params.linkId);
        res.status(204).send();
    }),
);
