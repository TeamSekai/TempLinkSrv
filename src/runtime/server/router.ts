import { fromFileUrl, relative } from 'std/path';
import { Hono } from 'hono';
import { serveStatic } from 'hono/middleware';

import { Registry } from './Registry.ts';
import { apiRouter } from '../api/apiRouter.ts';
import { Bindings } from '../server/TempLinkSrv.ts';

export const router = new Hono<{ Bindings: Bindings }>();

const rootHtmlPath = relative(Deno.cwd(), fromFileUrl(new URL('../../resources/html/index.html', import.meta.url)));

const notFoundHtmlPath = relative(Deno.cwd(), fromFileUrl(new URL('../../resources/html/404.html', import.meta.url)));

router.use('*', async (_c, next) => {
    console.log(`Time: ${Date.now()}`);
    await next();
});

router.use(
    '/',
    serveStatic({
        path: rootHtmlPath,
    }),
);

router.get('/:linkId', async (c, next) => {
    const id = c.req.param('linkId');
    if (id == 'api') {
        return await next();
    }
    const linkRecord = await Registry.instance.getLinkById(id);
    if (linkRecord == null) {
        await next();
    } else {
        return c.redirect(linkRecord.destination.toString(), 301);
    }
});

router.route('/api', apiRouter);

router.get(
    '*',
    serveStatic({
        path: notFoundHtmlPath,
    }),
);
