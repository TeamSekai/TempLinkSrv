import { Registry } from './Registry.ts';
import { tempLinkSrv } from './TempLinkSrv.ts';
import { CommandExecutor } from './CommandExecutor.ts';

const rawConsoleLog = console.log;
const rawConsoleWarn = console.warn;
const rawConsoleError = console.error;

export class ServerConsole {
    public static instance: ServerConsole = new ServerConsole();

    private static readonly ERASE_LINE = '\x1b[G\x1b[K';

    private static readonly PROMPT = ServerConsole.ERASE_LINE + '> ';

    private static readonly PROMPT_BYTES = new TextEncoder().encode(this.PROMPT);

    private static readonly ERASE_LINE_BYTES = new TextEncoder().encode(this.ERASE_LINE);

    private readonly decoder = new TextDecoder();

    private currentLine = '';

    /** 改行コード '\r\n' または '\r\n' の前半部分 */
    private newLineFormerHalf: '\n' | '\r' | null = null;

    private constructor() {}

    public enable() {
        this.enableInput();
    }

    public async log(...data: unknown[]) {
        await Deno.stdout.write(ServerConsole.ERASE_LINE_BYTES);
        rawConsoleLog(...data);
        await Deno.stdout.write(ServerConsole.PROMPT_BYTES);
    }

    public async warn(...data: unknown[]) {
        await Deno.stdout.write(ServerConsole.ERASE_LINE_BYTES);
        rawConsoleWarn(...data);
        await Deno.stdout.write(ServerConsole.PROMPT_BYTES);
    }

    public async error(...data: unknown[]) {
        await Deno.stdout.write(ServerConsole.ERASE_LINE_BYTES);
        rawConsoleError(...data);
        await Deno.stdout.write(ServerConsole.PROMPT_BYTES);
    }

    public async close() {
        await this.log('Server closed!');
    }

    private async enableInput() {
        await Deno.stdout.write(ServerConsole.PROMPT_BYTES);
        for await (const chunk of Deno.stdin.readable) {
            const text = this.decoder.decode(chunk);
            for (const c of text) {
                await this.acceptCharacter(c);
                if (tempLinkSrv.isClosed) {
                    return;
                }
            }
        }
        await tempLinkSrv.close();
    }

    private async acceptCharacter(c: string) {
        if (c == '\n') {
            if (this.newLineFormerHalf == '\r') {
                this.newLineFormerHalf = null;
            } else {
                this.newLineFormerHalf = '\n';
                await this.flushLine();
            }
        } else if (c == '\r') {
            if (this.newLineFormerHalf == '\n') {
                this.newLineFormerHalf = null;
            } else {
                this.newLineFormerHalf = '\r';
                await this.flushLine();
            }
        } else {
            this.currentLine += c;
            this.newLineFormerHalf = null;
        }
    }

    private async flushLine() {
        await this.acceptLine(this.currentLine);
        this.currentLine = '';
        await Deno.stdout.write(ServerConsole.PROMPT_BYTES);
    }

    private async acceptLine(line: string) {
        await CommandExecutor.instance.execute(line);
    }
}

console.log = rawConsoleLog;
console.error = rawConsoleError;
