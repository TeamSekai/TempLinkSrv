// @deno-types="npm:@types/express@4.17.21"
import express from 'npm:express@4.18.2';

import { CONFIG } from '../setup/index.ts';

const app = express();

app.get('/', (_req, res) => {
    res.send('Hello, world!');
});

app.listen(CONFIG.linkPort);
