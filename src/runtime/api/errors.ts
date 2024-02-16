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

export class TokenError extends ClientError {
    static {
        TokenError.prototype.name = 'TokenError';
    }

    public constructor(message: string) {
        super(message, 'Invalid Bearer token', 401); // 401 Unauthorized
    }
}
