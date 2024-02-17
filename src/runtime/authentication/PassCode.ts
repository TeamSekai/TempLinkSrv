import { randomUint8Array } from '../util/random.ts';
import { ReadonlyUint8Array, Uint8ArrayOf } from '../util/arrays.ts';

export class PassCode {
    public readonly bytes: ReadonlyUint8Array<26>;

    private constructor(bytes: ReadonlyUint8Array<26>) {
        this.bytes = bytes;
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
