import { Hono } from 'hono';

import { Bindings } from '../server/TempLinkSrv.ts';
import { linkApiRouter } from './linkApiRouter.ts';
import { Registry } from '../server/Registry.ts';

export const apiRouter = new Hono<{ Bindings: Bindings }>();

const scriptApiRouter = new Hono<{ Bindings: Bindings }>();

scriptApiRouter.get('/:linkId', async (c, next) => {
    const linkRecord = await Registry.instance.getLinkById(c.req.param('linkId'));
    if (linkRecord == null) {
        return await next();
    }
    c.header('Content-Type', 'text/javascript');
    return c.body(`location.href="${encodeURI(linkRecord.destination.toString())}"`);
});

apiRouter.route('/links', linkApiRouter);
apiRouter.route('/scripts', scriptApiRouter);
