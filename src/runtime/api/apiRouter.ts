import { Hono } from 'hono';

import { authenticationMiddleware } from '../authentication/authenticationMiddleware.ts';
import { requireLinkRequest } from './LinkAPI.ts';
import { LinkAPI } from './LinkAPI.ts';
import { ClientError } from './errors.ts';
import { ServerConsole } from '../server/ServerConsole.ts';

export const apiRouter = new Hono();

apiRouter.use('*', authenticationMiddleware);

apiRouter.post(
    '/links',
    async (c) => {
        const request = requireLinkRequest(await c.req.json());
        const response = await LinkAPI.instance.create(request);
        c.status(201);
        return c.body(JSON.stringify(response));
    },
);

apiRouter.get(
    '/links/:linkId',
    async (c) => {
        const response = await LinkAPI.instance.get(c.req.param('linkId'));
        c.status(200);
        return c.body(JSON.stringify(response));
    },
);

apiRouter.delete(
    '/links/:linkId',
    async (c) => {
        await LinkAPI.instance.delete(c.req.param('linkId'));
        c.status(204);
        return c.body(null);
    },
);

apiRouter.onError((e, c) => {
    if (e instanceof ClientError) {
        c.status(e.status);
        return c.body(JSON.stringify({
            type: 'error',
            description: e.clientMessage,
        }));
    } else {
        ServerConsole.instance.error(e);
        c.status(500);
        return c.body(null);
    }
});
