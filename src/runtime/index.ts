// @deno-types="npm:@types/express@4.17.21"
import express from 'npm:express@4.18.2';
import { fromFileUrl } from "https://deno.land/std@0.215.0/path/mod.ts";

import { CONFIG } from '../setup/index.ts';

const app = express();

const rootHtmlPath = fromFileUrl(new URL('../resources/html/index.html', import.meta.url));

app.get('/', (_req, res) => {
    res.sendFile(rootHtmlPath);
});

app.listen(CONFIG.linkPort, CONFIG.linkHostname);
