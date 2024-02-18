export class ClientError extends Error {
    static {
        ClientError.prototype.name = 'ClientError';
    }

    public readonly status: number;

    public readonly clientMessage: string;

    public constructor(message: string, clientMessage = message, status = 400) {
        super(`${clientMessage}; ${message}`);
        this.status = status;
        this.clientMessage = clientMessage;
    }
}

type AuthorizationErrorType = 'invalid_request' | 'invalid_token' | 'insufficient_scope' | null;

function authenticateErrorToStatus(error: AuthorizationErrorType) {
    switch (error) {
        default:
        case 'invalid_token':
            return 401;
        case 'invalid_request':
            return 400;
        case 'insufficient_scope':
            return 403;
    }
}

export class AuthorizationError extends ClientError {
    static {
        AuthorizationError.prototype.name = 'AuthorizationError';
    }

    public readonly wwwAuthenticateMessage;

    public constructor(
        message: string,
        wwwAuthenticateMessage: AuthorizationErrorType = null,
        clientMessage = message,
    ) {
        super(message, clientMessage, authenticateErrorToStatus(wwwAuthenticateMessage));
        this.wwwAuthenticateMessage = wwwAuthenticateMessage;
    }
}

export class TokenError extends AuthorizationError {
    static {
        TokenError.prototype.name = 'TokenError';
    }

    public constructor(message: string) {
        super(message, 'invalid_token', 'Invalid Bearer token');
    }
}
