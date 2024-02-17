import { randomUint8Array } from '../util/random.ts';
import { ReadonlyUint8Array, Uint8ArrayOf } from '../util/arrays.ts';

export class PassCode {
    public readonly bytes: ReadonlyUint8Array<26>;

    private constructor(bytes: ReadonlyUint8Array<26>) {
        this.bytes = bytes;
    }

    public async hash(salt: Uint8Array | ReadonlyUint8Array<32>) {
        if (salt.length != 32) {
            throw new RangeError(`The length of salt must be 32, but is ${salt.length}`);
        }
        const buffer = new Uint8Array(26 + 32);
        buffer.set(this.bytes);
        buffer.set(salt, 26);
        return new Uint8Array(await crypto.subtle.digest('SHA-256', buffer)) as Uint8ArrayOf<32>;
    }

    public static forBytes(bytes: ArrayLike<number>) {
        if (bytes.length != 26) {
            throw RangeError(`length of a PassCode must be 26, but there are ${bytes} bytes`);
        }
        return new PassCode(new Uint8Array(bytes) as Uint8ArrayOf<26>);
    }

    public static random() {
        return new PassCode(randomUint8Array(26));
    }
}
