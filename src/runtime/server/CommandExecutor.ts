import { ServerConsole } from './ServerConsole.ts';
import { Registry } from './Registry.ts';
import { tempLinkSrv } from './TempLinkSrv.ts';

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

    public expectEnd() {
        const rest = this.getRest();
        if (rest != '') {
            throw new SyntaxError(`Unexpected parameter(s) appearance: ${rest}`);
        }
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

    public async execute(command: string) {
        const parser = new Parser(command);
        const commandName = parser.getWord();
        try {
            switch (commandName) {
                case 'token-create':
                    await this.tokenCreate(parser);
                    break;
                case 'stop':
                    await this.stop(parser);
                    break;
                default:
                    ServerConsole.instance.error(`Unknown command: ${commandName}`);
                    break;
            }
        } catch (e) {
            ServerConsole.instance.error(`An error occurred while executing the command: ${e}`);
        }
    }

    private async tokenCreate(parser: Parser) {
        parser.expectEnd();
        const token = await Registry.instance.authentication.generateToken();
        ServerConsole.instance.log(token.toString());
    }

    private async stop(parser: Parser) {
        parser.expectEnd();
        await tempLinkSrv.close();
    }
}
