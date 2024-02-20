import { Hono } from 'hono';

import { Bindings } from '../server/TempLinkSrv.ts';
import { linkApiRouter } from './linkApiRouter.ts';

export const apiRouter = new Hono<{ Bindings: Bindings }>();

apiRouter.route('/links', linkApiRouter);
