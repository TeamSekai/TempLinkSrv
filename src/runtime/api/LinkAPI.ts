import { Registry } from '../server/Registry.ts';
import { ClientError } from './errors.ts';
import { CONFIG } from '../../setup/index.ts';
import { LinkRecord } from '../database/LinkRecord.ts';
import { ResponseValue } from './API.ts';

export interface LinkRequest {
    destination: string;
    expirationTime: number;
}

export interface LinkResource extends ResponseValue {
    type: 'link_resource';
    link: string;
    id: string;
    destination: string;
    expiration_time: number;
    creation_date: number;
    expiration_date: number;
}

function hasProperty<K extends string>(o: object, property: K): o is { [V in K]: unknown } {
    return property in o;
}

function requireProperty<K extends string>(o: object, property: K) {
    if (!hasProperty(o, property)) {
        throw new ClientError(`The object must have a property '${property}'`);
    }
    const value = o[property];
    return value;
}

function requireStringProperty<K extends string>(o: object, property: K) {
    const value = requireProperty(o, property);
    if (typeof value != 'string') {
        throw new ClientError(`The property '${property}' must be a string`);
    }
    return value;
}

function requireNumberProperty<K extends string>(o: object, property: K) {
    const value = requireProperty(o, property);
    if (typeof value != 'number') {
        throw new ClientError(`The property '${property}' must be a number`);
    }
    return value;
}

export function requireLinkRequest(body: unknown): LinkRequest {
    if (!(body instanceof Object)) {
        throw new ClientError('The request body must be an object');
    }
    return {
        destination: requireStringProperty(body, 'destination'),
        expirationTime: requireNumberProperty(body, 'expiration_time'),
    };
}

export class LinkAPI {
    public static readonly instance = new LinkAPI();

    public async create(linkRequest: LinkRequest): Promise<LinkResource | null> {
        const destination = stringToURL(linkRequest.destination);
        const result = await Registry.instance.createLink(destination, linkRequest.expirationTime);
        if (result == null) {
            throw new Error('Failed to create a link');
        }
        return toResource(result.id, result.record);
    }

    public async get(id: string): Promise<LinkResource | null> {
        const result = await Registry.instance.getLinkById(id);
        if (result == null) {
            return null;
        }
        return toResource(id, result);
    }

    public async delete(id: string): Promise<void> {
        const result = await Registry.instance.deleteLink(id);
        if (!result) {
            throw new ClientError(`Link '${id}' was not found`);
        }
    }
}

function stringToURL(s: string) {
    if (!s.startsWith('http://') && !s.startsWith('https://')) {
        throw new ClientError(`The destination must start with 'http://' or 'https://'; destination: ${s}`);
    }
    try {
        return new URL(s);
    } catch (_) {
        throw new ClientError(`Invalid URL: '${s}'`);
    }
}

function toResource(id: string, record: LinkRecord): LinkResource {
    return {
        type: 'link_resource',
        link: `https://${CONFIG.linkDomain}/${id}`,
        id,
        destination: record.destination.toString(),
        expiration_time: record.expirationTime,
        creation_date: record.creationDate,
        expiration_date: record.expirationDate,
    };
}
