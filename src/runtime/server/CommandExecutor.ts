import { ServerConsole } from './ServerConsole.ts';
import { Registry } from './Registry.ts';

function isWhitespace(c: string) {
    return /\s+/.test(c);
}

class Parser {
    private readonly command;

    private index = 0;

    public constructor(command: string) {
        this.command = command;
    }

    /**
     * 1単語だけ読み込む。
     * @returns 読み込まれた単語
     */
    public getWord() {
        const command = this.command;
        const commandLength = command.length;
        this.skipWhitespace();
        let result = '';
        while (this.index < commandLength) {
            const c = command.charAt(this.index);
            if (isWhitespace(c)) {
                break;
            }
            result += c;
            this.index++;
        }
        return result;
    }

    /**
     * 空白を読み飛ばして残りの文字列をすべて読み込む。
     * @returns 残りの文字列
     */
    public getRest() {
        this.skipWhitespace();
        const command = this.command;
        const result = command.substring(this.index);
        this.index = command.length;
        return result;
    }

    private skipWhitespace() {
        const command = this.command;
        const commandLength = command.length;
        while (this.index < commandLength) { // 空白文字を読み飛ばす
            const c = command.charAt(this.index);
            if (!isWhitespace(c)) {
                break;
            }
            this.index++;
        }
    }
}

export class CommandExecutor {
    public static readonly instance = new CommandExecutor();

    private constructor() {}

    async execute(command: string) {
        const parser = new Parser(command);
        const commandName = parser.getWord();
        if (commandName == 'link-create') {
            await this.linkCreate(parser);
        }
    }

    async linkCreate(parser: Parser) {
        const expirationTime = Number.parseInt(parser.getWord());
        const destination = new URL(parser.getRest());
        const id = await Registry.instance.createLink(destination, expirationTime);
        if (id == null) {
            await ServerConsole.instance.log('Failed to create a link');
        } else {
            await ServerConsole.instance.log(`Created a link as '${id}'`);
        }
    }
}
