import { parse } from 'npm:yaml@2.3.4';

const DEFAULT_CONFIG_FILENAME = "../resources/config.yml";
const CONFIG_FILENAME = "../../config.yml";
const DEFAULT_CONFIG_PATH = new URL(DEFAULT_CONFIG_FILENAME, import.meta.url);
const CONFIG_PATH = new URL(CONFIG_FILENAME, import.meta.url);

export interface Config {
    linkPort: number;
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
    const [result, config] = await Promise.all([
        (async () => parse(await Deno.readTextFile(DEFAULT_CONFIG_PATH)))(),
        (async () => {
            const content = await getConfigContent();
            return content != null ? parse(content) : {};
        })()
    ]);
    return Object.assign(result, config) as Config;
}

export const CONFIG = await getConfig();

console.log("Setup is done!");
