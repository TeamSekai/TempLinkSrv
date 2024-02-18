// @deno-types="npm:@types/express@4.17.21"
import { RequestHandler } from 'express';
import { AuthorizationError, TokenError } from '../api/errors.ts';
import { BearerToken } from '../api/BearerToken.ts';
import { Registry } from '../server/Registry.ts';

export const authenticationMiddleware: RequestHandler = async (req, res, next) => {
    try {
        await requireValidToken(req.header('Authorization'));
    } catch (e) {
        if (e instanceof AuthorizationError) {
            let wwwAuthenticate = 'Bearer realm=""';
            if (e.wwwAuthenticateMessage != null) {
                wwwAuthenticate += ` error="${e.wwwAuthenticateMessage}"`;
                wwwAuthenticate += ` error_description="${e.clientMessage}"`;
            }
            res.set('WWW-Authenticate', wwwAuthenticate);
            res.status(e.status).send({
                type: 'error',
                description: e.clientMessage,
            });
        }
    }
    next();
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
