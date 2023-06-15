// @ts-check
import { spawn } from 'node:child_process';
import path from 'node:path';
import { setSessionAction } from './set-terminal-title';

export function runShellCommand(cmd, addMessage, sessionContext) {

    console.log('Shell command is: ', cmd);

    // TODO: If cmd contains &&, it's possibly simple commands so we can use execAsync
    if (cmd.indexOf('&&') > -1) {
        const allCmds = cmd.split('&&').map((c) => c.trim());
        console.log('Splitted commands into: ', allCmds);
        let timeout = 0;
        for (let c of allCmds) {
            timeout += 3000;
            setTimeout(() => runShellCommand(c, addMessage), timeout);
        }
        return;
    }

    if (cmd.trim().indexOf('cd ') == 0) {
        const newDir = cmd.split(' ').slice(1).join(' ');
        try {
            const currentDir = process.cwd();
            process.chdir(path.join(currentDir, newDir));
        } catch {
            // Weird error when calling a process from a directory that no longer exists
        }
        if (addMessage) {
            addMessage('user', 'Directory is now: ' + process.cwd());
        }
        return;
    }

    if (addMessage) {
        setSessionAction('Executing command... Current folder: ' + process.cwd(), sessionContext);
    }

    const command = cmd.split(' ')[0];
    const args = cmd.split(' ').slice(1);
    return new Promise((resolve, reject) => {
        const child = spawn(command, args);

        child.stdout.on('data', (data) => {
            child.stdin.write('\n'); // Send an "Enter" key press so that if the bot is stoopid and run a CLI with options, it will auto-answer.
        });

        child.stderr.on('data', (data) => {
            if (addMessage) {
                addMessage('user', 'STDERR is: ' + data.toString())
            }
        });

        child.on('error', (error) => {
            if (addMessage) {
                addMessage('user', 'Error: ' + error.toString());
            }
            reject(error);
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve('command closed');
            } else {
                if (addMessage) {
                    addMessage('user', 'Code: ' + (code || 'undefined').toString());
                }
                reject(new Error(`Command exited with code ${code}`));
            }
        });
    });
}
