// @ts-check
import { spawn } from 'node:child_process';
import { opendirSync } from 'node:fs';

export function dir(workspaceDirectory) {
    process.chdir(workspaceDirectory);

    if (isEmptyDir(workspaceDirectory)) {
        return 'Project directory is empty, no file yet.'
    }

    return new Promise((resolve, reject) => {
        const cmd = spawn('find', [
            '.', '-type', 'd', '(', '-name', '.angular', '-o', '-name', '.git', '-o', '-name', 'node_modules', ')', '-prune', '-o', '-type', 'f', '-print'
        ]);

        let result = '';

        cmd.stdout.on('data', (data) => {
            result += data.toString();
        });

        cmd.on('close', (code) => {
            if (code !== 0) reject(`Error: shell command exited with code ${code}`);
            resolve(result.trim());
        });
    });
}

function isEmptyDir(path) {
    try {
        const directory = opendirSync(path)
        const entry = directory.readSync()
        directory.closeSync();
        return entry === null
    } catch (error) {
        return false
    }
}