import { decodeBase64, encodeBase64 } from 'std/encoding/base64';

import { TokenError } from './errors.ts';
import { UUIDv4 } from '../authentication/UUIDv4.ts';
import { PassCode } from '../authentication/PassCode.ts';

const TOKEN_PATTERN = /^Tl._[A-Za-z0-9+\/]{56}$/;

/**
 * このサーバーにおける Bearer 認証のトークンを表すクラス。
 * トークンは以下の形で情報を含む。
 * ```
 * Tl[バージョン]_[ユーザー+パスコード]
 * ```
 * バージョンは1文字であり、現在は `0` に固定されている。
 * ユーザー+パスコードは56文字であり、
 * 16バイトの UUID であるユーザー情報と26バイトのパス情報を結合して Base64 エンコードしたものである。
 */
export class BearerToken {
    public readonly version = '0';

    public readonly user: UUIDv4;

    public readonly passCode: PassCode;

    public constructor(user: UUIDv4, passCode: PassCode) {
        this.user = user;
        this.passCode = passCode;
    }

    public static generate() {
        return new BearerToken(UUIDv4.random(), PassCode.random());
    }

    public static forString(value: string) {
        if (!TOKEN_PATTERN.test(value)) {
            throw new TokenError(`Must match regular expression '${TOKEN_PATTERN}'`);
        }
        const version = value.charAt(2);
        if (version != '0') {
            throw new TokenError(`Invalid Bearer token version: '${version}'`);
        }
        const base64Decoded = decodeBase64(value.substring(4));
        const user = UUIDv4.fromUint8Array(base64Decoded.slice(0, 16));
        const passCode = PassCode.forBytes(base64Decoded.slice(16));
        return new BearerToken(user, passCode);
    }

    public toString() {
        const base64Decoded = new Uint8Array(16 + 26);
        base64Decoded.set(this.user.toUint8Array());
        base64Decoded.set(this.passCode.bytes, 16);
        return `Tl${this.version}_${encodeBase64(base64Decoded)}`;
    }
}
