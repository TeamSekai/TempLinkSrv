import { ReadonlyUint8Array, Uint8ArrayOf } from '../util/arrays.ts';

function requireReadonlyUint8Array<N extends number>(buffer: Uint8Array, length: N, name: string) {
    if (buffer.length != length) {
        throw new RangeError(`The length of ${name} must be ${length}, but is ${buffer.length}`);
    }
    return buffer.slice() as Uint8ArrayOf<N> as ReadonlyUint8Array<N>;
}

export class UserRecord {
    public readonly salt: ReadonlyUint8Array<32>;

    public readonly hash: ReadonlyUint8Array<32>;

    public constructor(salt: Uint8Array, hash: Uint8Array) {
        this.salt = requireReadonlyUint8Array(salt, 32, 'salt');
        this.hash = requireReadonlyUint8Array(hash, 32, 'hash');
    }
}
