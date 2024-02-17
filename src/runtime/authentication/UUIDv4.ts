import * as uuid from 'std/uuid';

import { TokenError } from '../api/errors.ts';
import { bufferToHexString, hexStringToBuffer } from '../util/arrays.ts';

/**
 * UUID v4 を表現するオブジェクト。
 * Token で用いる。
 */
export class UUIDv4 {
    private readonly representation: string;

    public constructor(representation: string) {
        if (!uuid.v4.validate(representation)) {
            throw new TokenError(`Invalid v4 UUID: ${representation}`);
        }
        this.representation = representation;
    }

    public static random() {
        return new UUIDv4(crypto.randomUUID());
    }

    public static fromUint8Array(buffer: Uint8Array) {
        if (buffer.length != 16) {
            throw new RangeError(`Invalid buffer length: ${buffer.length}`);
        }
        const s1 = bufferToHexString(buffer, 0, 4);
        const s2 = bufferToHexString(buffer, 4, 6);
        const s3 = bufferToHexString(buffer, 6, 8);
        const s4 = bufferToHexString(buffer, 8, 10);
        const s5 = bufferToHexString(buffer, 10, 16);
        const representation = `${s1}-${s2}-${s3}-${s4}-${s5}`;
        return new UUIDv4(representation);
    }

    public toUint8Array() {
        const representation = this.representation;
        const result = new Uint8Array(16);
        hexStringToBuffer(representation.substring(0, 8), result, 0);
        hexStringToBuffer(representation.substring(9, 13), result, 4);
        hexStringToBuffer(representation.substring(14, 18), result, 6);
        hexStringToBuffer(representation.substring(19, 23), result, 8);
        hexStringToBuffer(representation.substring(24, 36), result, 10);
        return result;
    }

    public toString() {
        return this.representation;
    }
}
