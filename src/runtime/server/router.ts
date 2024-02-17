// @deno-types="npm:@types/express@4.17.21"
import * as express from 'express';
import { fromFileUrl } from 'std/path';

import { Registry } from './Registry.ts';

export const router = express.Router();

const rootHtmlPath = fromFileUrl(new URL('../../resources/html/index.html', import.meta.url));

const notFoundHtmlPath = fromFileUrl(new URL('../../resources/html/404.html', import.meta.url));

router.get('/', (_req, res) => {
    res.sendFile(rootHtmlPath);
});

router.get('/:linkId', async (req, res) => {
    const id = req.params.linkId;
    const linkRecord = await Registry.instance.getLinkById(id);
    if (linkRecord == null) {
        return res.status(404).sendFile(notFoundHtmlPath);
    }
    return res.redirect(301, linkRecord.destination.toString());
});
