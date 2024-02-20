/** @jsx jsx */
import { Hono } from 'hono';
import { jsx } from 'hono/middleware';

import { Registry } from './Registry.ts';

export const linkRouter = new Hono();

linkRouter.get('/:linkId', async (c, next) => {
    const id = c.req.param('linkId');
    const linkRecord = await Registry.instance.getLinkById(id);
    if (linkRecord == null) {
        return await next();
    }
    const destination = linkRecord.destination.toString();
    return c.html(
        <html>
            <body>
                <script src={`/api/scripts/${id}`}></script>
            </body>
        </html>,
    );
});
