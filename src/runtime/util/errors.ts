export class IllegalArgumentError extends Error {
    static {
        IllegalArgumentError.prototype.name = 'IllegalArgumentError';
    }

    public constructor(message: string) {
        super(message);
    }
}
