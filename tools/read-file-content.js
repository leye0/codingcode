// @ts-check
import { readFileSync } from 'fs';
import { dir } from './dir';
import path from 'path';

export async function readFileContent(filePath, workspaceDirectory) {
    try {
        const data = readFileSync(path.join(process.cwd(), filePath), 'utf-8');
        return data;
    } catch (error) {
        console.log(error);
        const projectFileStructure = await dir(workspaceDirectory);
        return 'Error: No such file\r\nYou made an error in the folder name or file name. You need to take an existing path from the current files. Please note that the READ_COMMAND was executed in this folder: ' + process.cwd() + ' The current project file structure is:\n\n' + projectFileStructure;
    }
}
