import { parse } from 'yaml';
import { requireStringProperty } from '../common/objects.ts';
import { requireNumberProperty } from '../common/objects.ts';
import { requireChoiceProperty } from '../common/objects.ts';
import { requireStringArrayProperty } from '../common/objects.ts';
import { requireBooleanProperty } from '../common/objects.ts';

const DEFAULT_CONFIG_FILENAME = '../resources/config.yml';
const CONFIG_FILENAME = '../../config.yml';
const DEFAULT_CONFIG_PATH = new URL(DEFAULT_CONFIG_FILENAME, import.meta.url);
const CONFIG_PATH = new URL(CONFIG_FILENAME, import.meta.url);

// プロパティ名は config.yml と一致させること
export interface Config {
    readonly linkDomain: string;
    readonly linkHostname: string;
    readonly linkPort: number;
    readonly linkIdCharacters: string;
    readonly linkIdLength: number;
    readonly linkIdTrials: number;
    readonly linkExpirationPrepareTime: number;
    readonly linkExpirationPrepareInterval: number;
    readonly databaseType: 'sqlite' | 'mongodb' | 'volatile';
    readonly databaseHostname: string;
    readonly databasePort: number;
    readonly databaseUsername: string;
    readonly databasePassword: string;
    readonly databaseName: string;
    readonly databaseAuthenticationSource: string;
    readonly apiAccessIpWhitelist: string[];
    readonly useXForwardedFor: boolean;
}

async function getConfigContent() {
    try {
        return await Deno.readTextFile(CONFIG_PATH);
    } catch (_e) {
        await Deno.copyFile(DEFAULT_CONFIG_PATH, CONFIG_PATH);
        return;
    }
}

async function getConfig() {
    const [base, config] = await Promise.all([
        (async () => parse(await Deno.readTextFile(DEFAULT_CONFIG_PATH)))(),
        (async () => {
            const content = await getConfigContent();
            return content != null ? parse(content) : {};
        })(),
    ]);
    Object.assign(base, config);
    const result: Config = {
        linkDomain: requireStringProperty(base, 'linkDomain'),
        linkHostname: requireStringProperty(base, 'linkHostname'),
        linkPort: requireNumberProperty(base, 'linkPort'),
        linkIdCharacters: requireStringProperty(base, 'linkIdCharacters'),
        linkIdLength: requireNumberProperty(base, 'linkIdLength'),
        linkIdTrials: requireNumberProperty(base, 'linkIdTrials'),
        linkExpirationPrepareTime: requireNumberProperty(base, 'linkExpirationPrepareTime'),
        linkExpirationPrepareInterval: requireNumberProperty(base, 'linkExpirationPrepareInterval'),
        databaseType: requireChoiceProperty(base, 'databaseType', ['sqlite', 'mongodb', 'volatile']),
        databaseHostname: requireStringProperty(base, 'databaseHostname'),
        databasePort: requireNumberProperty(base, 'databasePort'),
        databaseUsername: requireStringProperty(base, 'databaseUsername'),
        databasePassword: requireStringProperty(base, 'databasePassword'),
        databaseName: requireStringProperty(base, 'databaseName'),
        databaseAuthenticationSource: requireStringProperty(base, 'databaseAuthenticationSource'),
        apiAccessIpWhitelist: requireStringArrayProperty(base, 'apiAccessIpWhitelist'),
        useXForwardedFor: requireBooleanProperty(base, 'useXForwardedFor'),
    };
    return Object.freeze(result);
}

export const CONFIG = await getConfig();

const networks: string[] = [];
networks.push(`${CONFIG.linkHostname}:${CONFIG.linkPort}`);
if (CONFIG.databaseType == 'mongodb') {
    networks.push(`${CONFIG.databaseHostname}:${CONFIG.databasePort}`);
}

console.log(`-- Setup is done! --
-- Network will be allowed at: --
${networks.join(',')}`);
