import * as fs from 'fs';
import vscode from 'vscode';
import chokidar from 'chokidar';
import { createTerminal, closeTerminal, findTerminal } from './util';
import { getNonce } from '../util';

const DEFAULT_TERMINAL_NAME = 'AppMap';

export interface TerminalResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export default class Terminal {
  private instance: vscode.Terminal;
  private name: string;
  private cwd: fs.PathLike;
  private baseDir: fs.PathLike;
  private watcher: chokidar.FSWatcher = new chokidar.FSWatcher();

  constructor(cwd: fs.PathLike, name: string) {
    this.cwd = cwd;
    this.name = name ?? DEFAULT_TERMINAL_NAME;
    this.baseDir =
      (this.cwd as string) + '/tmp/appmap/terminal/' + this.name + '/' + getNonce() + '/';

    this.prepareFiles();

    let terminal = findTerminal(this.name);
    if (!terminal || !!terminal.exitStatus) {
      terminal = createTerminal(this.name, this.cwd);

      vscode.window.onDidCloseTerminal((term) => {
        if (term.name === this.name) {
          closeTerminal(this.name);
        }
      });
    }

    this.instance = terminal;
  }

  public async run(command: string): Promise<TerminalResult> {
    return this.exec(command);
  }

  private prepareFiles() {
    fs.mkdirSync(this.baseDir, { recursive: true });

    ['exitStatus', 'output'].forEach((filename) => {
      const pathname = this.baseDir + filename;
      if (fs.existsSync(pathname)) {
        fs.unlinkSync(pathname);
      }
      fs.closeSync(fs.openSync(pathname, 'w'));
    });

    this.watcher = chokidar.watch(this.baseDir + 'output', {
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100,
      },
    });
  }

  private exec(command: string): Promise<TerminalResult> {
    const echoStatus = 'echo $? > ' + this.baseDir + 'exitStatus';
    const cmd =
      command + ' 2>&1 | tee + ' + this.baseDir + 'output && ' + echoStatus + ' || ' + echoStatus;

    this.instance.sendText(cmd, true);
    this.instance.show();

    return new Promise((resolve, reject) => {
      this.watcher.on('change', (path) => {
        console.log(`File ${path} has been added`);

        try {
          const output = fs.readFileSync(this.baseDir + 'output').toString();
          const exitCode = parseInt(fs.readFileSync(this.baseDir + 'exitStatus').toString());
          console.log('exitcode: ' + exitCode);
          resolve({
            exitCode: exitCode,
            stdout: exitCode === 0 ? output : '',
            stderr: exitCode !== 0 ? output : '',
          });
        } catch (e) {
          reject({ exitCode: 1, stdout: '', stderr: e.message });
        } finally {
          this.watcher.close().then(() => console.log('closed'));
        }
      });
    });
  }
}
