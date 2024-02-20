import { Registry } from '../server/Registry.ts';
import { ClientError } from './errors.ts';
import { CONFIG } from '../../setup/index.ts';
import { LinkRecord } from '../database/LinkRecord.ts';
import { ResponseValue } from './api.ts';
import { requireNumberProperty, requireStringProperty } from '../../common/objects.ts';

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

export function requireLinkRequest(body: unknown): LinkRequest {
    if (!(body instanceof Object)) {
        throw new ClientError('The request body must be an object');
    }
    try {
        return {
            destination: requireStringProperty(body, 'destination'),
            expirationTime: requireNumberProperty(body, 'expiration_time'),
        };
    } catch (e) {
        throw new ClientError(e.message);
    }
}

export class LinkAPI {
    public static readonly instance = new LinkAPI();

    public async create(linkRequest: LinkRequest): Promise<LinkResource> {
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
