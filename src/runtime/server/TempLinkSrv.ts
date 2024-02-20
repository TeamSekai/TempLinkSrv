import { CONFIG } from '../../setup/index.ts';
import { ServerConsole } from './ServerConsole.ts';
import { Registry } from './Registry.ts';
import { router } from './router.ts';
import { Hono } from 'hono';

export type Bindings = {
    info: Deno.ServeHandlerInfo;
};

export class TempLinkSrv {
    public static readonly instance = new TempLinkSrv();

    private readonly server;

    private closed = false;

    private constructor() {
        ServerConsole.instance.enable();
        const app = new Hono<{ Bindings: Bindings }>();
        app.route('/', router);
        this.server = Deno.serve({
            port: CONFIG.linkPort,
            hostname: CONFIG.linkHostname,
        }, (request, info) => {
            return app.fetch(request, { info });
        });
    }

    public close() {
        return Promise.all([
            Registry.instance.close(),
            ServerConsole.instance.close(),
            this.server.shutdown(),
        ]);
    }

    public get isClosed() {
        return this.closed;
    }
}

export const tempLinkSrv = TempLinkSrv.instance;
