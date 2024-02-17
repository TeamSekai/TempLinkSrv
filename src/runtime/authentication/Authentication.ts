import { AssertionError } from 'std/assert/assertion_error';

import { BearerToken } from '../api/BearerToken.ts';
import { DataStorage } from '../database/DataStorage.ts';
import { randomUint8Array } from '../util/random.ts';
import { UserRecord } from './UserRecord.ts';

export class Authentication {
    private readonly storage: DataStorage;

    public constructor(storage: DataStorage) {
        this.storage = storage;
    }

    public async generateToken(): Promise<BearerToken> {
        const token = BearerToken.generate();
        const salt = randomUint8Array(32);
        const hash = await token.passCode.hash(salt);
        const success = this.storage.insertUser(token.user, new UserRecord(salt, hash));
        if (!success) {
            throw new AssertionError('Failed to insert a new user');
        }
        return token;
    }

    public async testToken(token: BearerToken): Promise<boolean> {
        const userRecord = await this.storage.selectUser(token.user);
        return userRecord != null && await userRecord.test(token.passCode);
    }
}
