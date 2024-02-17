// @deno-types="npm:@types/express@4.17.21"
import express from 'express';
import { fromFileUrl } from 'std/path';

import { CONFIG } from '../../setup/index.ts';
import { ServerConsole } from './ServerConsole.ts';
import { Registry } from './Registry.ts';
import { router } from './router.ts';

export class TempLinkSrv {
    public static readonly instance = new TempLinkSrv();

    private readonly app = express();

    private readonly server;

    private closed = false;

    private constructor() {
        ServerConsole.instance.enable();
        this.app.use(router);
        this.server = this.app.listen(CONFIG.linkPort, CONFIG.linkHostname);
    }

    public close() {
        return Promise.all([
            Registry.instance.close(),
            ServerConsole.instance.close(),
            new Promise<void>((resolve, reject) => {
                this.server.close((err: unknown) => {
                    if (err == null) {
                        this.closed = true;
                        resolve();
                    } else {
                        reject(err);
                    }
                });
            }),
        ]);
    }

    public get isClosed() {
        return this.closed;
    }
}

export const tempLinkSrv = TempLinkSrv.instance;
