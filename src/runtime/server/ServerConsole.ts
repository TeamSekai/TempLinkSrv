import { tempLinkSrv } from './TempLinkSrv.ts';
import { CommandExecutor } from './CommandExecutor.ts';
import { JobQueue } from '../util/JobQueue.ts';

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

    private readonly outputQueue = new JobQueue();

    private constructor() {}

    public enable() {
        this.enableInput();
    }

    public log(...data: unknown[]) {
        this.outputQueue.add(async () => {
            await Deno.stdout.write(ServerConsole.ERASE_LINE_BYTES);
            rawConsoleLog(...data);
            await Deno.stdout.write(ServerConsole.PROMPT_BYTES);
        });
    }

    public warn(...data: unknown[]) {
        this.outputQueue.add(async () => {
            await Deno.stdout.write(ServerConsole.ERASE_LINE_BYTES);
            rawConsoleWarn(...data);
            await Deno.stdout.write(ServerConsole.PROMPT_BYTES);
        });
    }

    public error(...data: unknown[]) {
        this.outputQueue.add(async () => {
            await Deno.stdout.write(ServerConsole.ERASE_LINE_BYTES);
            rawConsoleError(...data);
            await Deno.stdout.write(ServerConsole.PROMPT_BYTES);
        });
    }

    public close() {
        this.log('Server closed!');
    }

    private async enableInput() {
        this.outputQueue.add(() => Deno.stdout.write(ServerConsole.PROMPT_BYTES));
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
        this.outputQueue.add(() => Deno.stdout.write(ServerConsole.PROMPT_BYTES));
    }

    private async acceptLine(line: string) {
        await CommandExecutor.instance.execute(line);
    }
}

console.log = ServerConsole.instance.log.bind(ServerConsole.instance);
console.warn = ServerConsole.instance.warn.bind(ServerConsole.instance);
console.error = ServerConsole.instance.error.bind(ServerConsole.instance);
