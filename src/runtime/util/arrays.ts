import { IllegalArgumentError } from './errors.ts';

export type ArrayOf<E, N extends number> = E[] & { length: N };

export interface Uint8ArrayOf<N extends number = number> extends Uint8Array {
    readonly length: N;
}

// https://github.com/microsoft/TypeScript/issues/37792#issuecomment-1264705598
export interface ReadonlyUint8Array<N extends number = number>
    extends Omit<Uint8ArrayOf<N>, 'copyWithin' | 'fill' | 'reverse' | 'set' | 'sort' | 'subarray' | 'valueOf'> {
    readonly [n: number]: number;

    readonly length: N;

    subarray(begin?: number, end?: number): ReadonlyUint8Array<number>;
}

export function bufferToHexString(buffer: ArrayLike<number>, start = 0, end: number = buffer.length) {
    if (start < 0 || end > buffer.length || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end) {
        throw new RangeError(`buffer.length: ${buffer.length}, start: ${start}, end: ${end}`);
    }
    let result = '';
    for (let i = start; i < end; i++) {
        result += buffer[i].toString(16).padStart(2, '0');
    }
    return result;
}

export function hexStringToBuffer(s: string, buffer: Uint8Array | null = null, start = 0) {
    if (!/^([0-9A-Fa-z][0-9A-Fa-z])*$/.test(s)) {
        throw new IllegalArgumentError(`Not a valid hex string: '${s}'`);
    }
    const length = s.length / 2;
    if (buffer == null) {
        buffer = new Uint8Array(start + length);
    } else if (buffer.length < start + length) {
        throw new RangeError('buffer does not have an enough length');
    }
    for (let i = 0; i < length; i++) {
        buffer[start + i] = Number.parseInt(s.substring(i * 2, (i + 1) * 2), 16);
    }
    return buffer;
}

export function uint8ArrayOf<N extends number>(length: N): Uint8ArrayOf<N>;

export function uint8ArrayOf<N extends number>(array: ArrayOf<number, N>): Uint8ArrayOf<N>;

export function uint8ArrayOf<N extends number>(arrayOrLength: ArrayOf<number, N> | N): Uint8ArrayOf<N> {
    if (typeof arrayOrLength == 'number') {
        return new Uint8Array(arrayOrLength) as Uint8ArrayOf<N>;
    }
    return new Uint8Array(arrayOrLength) as Uint8ArrayOf<N>;
}

export function isArrayEqual<T>(a1: ArrayLike<T>, a2: ArrayLike<T>) {
    const length = a1.length;
    if (length != a2.length) {
        return false;
    }
    for (let i = 0; i < length; i++) {
        if (a1[i] != a2[i]) {
            return false;
        }
    }
    return true;
}
