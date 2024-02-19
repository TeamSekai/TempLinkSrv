import { MiddlewareHandler } from 'hono';

import { AuthorizationError, TokenError } from '../api/errors.ts';
import { BearerToken } from '../api/BearerToken.ts';
import { Registry } from '../server/Registry.ts';

export const authenticationMiddleware: MiddlewareHandler = async (c, next) => {
    try {
        await requireValidToken(c.req.header('Authorization'));
    } catch (e) {
        if (e instanceof AuthorizationError) {
            let wwwAuthenticate = 'Bearer realm=""';
            if (e.wwwAuthenticateMessage != null) {
                wwwAuthenticate += ` error="${e.wwwAuthenticateMessage}"`;
                wwwAuthenticate += ` error_description="${e.clientMessage}"`;
            }
            c.set('WWW-Authenticate', wwwAuthenticate);
            c.status(e.status);
            return c.body(JSON.stringify({
                type: 'error',
                description: e.clientMessage,
            }));
        }
    }
    await next();
};

async function requireValidToken(authorizationField: string | undefined) {
    if (authorizationField == null) {
        throw new AuthorizationError('Authorization field is not set');
    }
    if (!authorizationField.startsWith('Bearer ')) {
        throw new AuthorizationError('Only Bearer authorization type is accepted');
    }
    const token = BearerToken.forString(authorizationField.substring(7));
    if (!await Registry.instance.authentication.testToken(token)) {
        throw new TokenError('Testing token failed');
    }
}
