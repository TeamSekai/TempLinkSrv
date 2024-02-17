// @deno-types="npm:@types/express@4.17.21"
import { Router } from 'express';
import { fromFileUrl } from 'std/path';

import { Registry } from './Registry.ts';
import { apiRouter } from '../api/apiRouter.ts';

export const router = Router();

const rootHtmlPath = fromFileUrl(new URL('../../resources/html/index.html', import.meta.url));

const notFoundHtmlPath = fromFileUrl(new URL('../../resources/html/404.html', import.meta.url));

router.use((_req, _res, next) => {
    console.log(`Time: ${Date.now()}`);
    next();
});

router.get('/', (_req, res) => {
    res.sendFile(rootHtmlPath);
});

router.get('/:linkId', async (req, res, next) => {
    const id = req.params.linkId;
    if (id == 'api') {
        return next();
    }
    const linkRecord = await Registry.instance.getLinkById(id);
    if (linkRecord == null) {
        return res.status(404).sendFile(notFoundHtmlPath);
    }
    return res.redirect(301, linkRecord.destination.toString());
});

router.use('/api', apiRouter);
