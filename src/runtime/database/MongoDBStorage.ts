import { Binary, MongoClient } from 'mongo';

import { UUIDv4 } from '../authentication/UUIDv4.ts';
import { UserRecord } from '../authentication/UserRecord.ts';
import { DataStorage } from './DataStorage.ts';
import { LinkRecord } from './LinkRecord.ts';
import { CONFIG } from '../../setup/index.ts';

interface LinkSchema {
    _id: string;
    destination: string;
    expirationTime: number;
    creationDate: number;
}

interface UserSchema {
    _id: string;
    salt: Binary;
    hash: Binary;
}

async function setupDatabase() {
    const client = new MongoClient();
    const db = await client.connect(
        `mongodb://${CONFIG.databaseUsername}:${CONFIG.databasePassword}@${CONFIG.databaseHostname}:` +
            `${CONFIG.databasePort}/${CONFIG.databaseName}?authSource=${CONFIG.databaseAuthenticationSource}`,
    );
    const links = db.collection<LinkSchema>('links');
    const users = db.collection<UserSchema>('users');
    return { client, db, collections: { links, users } };
}

export class MongoDBStorage implements DataStorage {
    private readonly clientPromise = setupDatabase();

    linkCount = async () => {
        return await (await this.clientPromise).collections.links.countDocuments();
    };

    insertLink = async (id: string, record: LinkRecord) => {
        const links = (await this.clientPromise).collections.links;
        if (await links.countDocuments({ _id: id }) != 0) {
            return false;
        }
        await links.insertOne({
            _id: id,
            destination: record.destination.toString(),
            expirationTime: record.expirationTime,
            creationDate: record.creationDate,
        });
        return true;
    };

    selectLinkById = async (id: string) => {
        const result = await (await this.clientPromise).collections.links.findOne({ _id: id });
        if (result == null) {
            return null;
        }
        return new LinkRecord(new URL(result.destination), result.expirationTime, result.creationDate);
    };

    selectLinksByExpirationDate = async (expirationDate: number) => {
        const result = (await this.clientPromise).collections.links.aggregate([
            {
                $project: {
                    destination: 1,
                    expirationTime: 1,
                    creationData: 1,
                    expirationDate: { $add: ['$creationDate', '$expirationTime'] },
                },
            },
            {
                $match: {
                    expirationDate: { $lte: expirationDate },
                },
            },
        ]);
        return new Map(
            await result.map(
                (item) => [
                    item._id,
                    new LinkRecord(new URL(item.destination), item.expirationTime, item.creationDate),
                ],
            ),
        );
    };

    deleteLink = async (id: string) => {
        const links = (await this.clientPromise).collections.links;
        if (await links.countDocuments({ _id: id }) == 0) {
            return false;
        }
        await links.deleteOne({ _id: id });
        return true;
    };

    userCount = async () => {
        return await (await this.clientPromise).collections.users.countDocuments();
    };

    insertUser = async (id: UUIDv4, record: UserRecord) => {
        const users = (await this.clientPromise).collections.users;
        if (await users.countDocuments({ _id: id.toString() }) != 0) {
            return false;
        }
        await users.insertOne({
            _id: id.toString(),
            salt: new Binary(record.salt.slice()),
            hash: new Binary(record.hash.slice()),
        });
        return true;
    };

    selectUser = async (id: UUIDv4) => {
        const result = await (await this.clientPromise).collections.users.findOne({ _id: id.toString() });
        if (result == null) {
            return null;
        }
        return new UserRecord(result.salt.buffer, result.hash.buffer);
    };

    deleteUser = async (id: UUIDv4) => {
        const users = (await this.clientPromise).collections.users;
        if (await users.countDocuments({ _id: id.toString() }) == 0) {
            return false;
        }
        await users.deleteOne({ _id: id.toString() });
        return true;
    };

    close = async () => {
        (await this.clientPromise).client.close();
    };
}
