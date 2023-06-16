// @ts-check
import { unachieverHints } from './consts';

export function findReferencesToPreviousCode(fileContent) {
    let gptBadCoder = false;
    let badLines = [];
    const allLines = fileContent.split('\n');
    for (let line of allLines) {
        if (line.trim().indexOf('//') > -1 || line.trim().indexOf('#') > -1 || line.trim().indexOf('<!--') > -1) {
            for (let hint of unachieverHints) {
                if (line.toLowerCase().indexOf(hint) > -1) {
                    gptBadCoder = true;
                    badLines.push(line.trim());
                }
            }
        }
    }
    return badLines;
}
