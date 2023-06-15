// @ts-check
import gitDiff from 'git-diff';
import { commonCommentStartInDifferentLanguages, unachieverHints } from './consts';

// Whenever GPT uses references to previous code, this method should (try to) fix it
export function repairFile(previousFileContent, nextFileContent) {

    const diff = gitDiff(previousFileContent, nextFileContent, { noHeaders: true, flags: '-U10000 --ignore-all-space ' }) || '';
    const diffHunks = diff.split('\n'); // .map(h => h.trim() === '' ? '!@#$%$#@!' : h).join('\n').split('!@#$%$#@!\n');
    let hasAtLeastOneReferenceToPreviousCode = false;
    console.log(JSON.stringify(diffHunks, null, 4));

    if ((1 == 1) == true) {
        process.exit(0);
    }

    const newFileLines = [];
    for (let h of diffHunks) {
        h = h.replace('!@#$%$#@!', '');
        h = h.toLowerCase().replace('no newline at end of file', '').trim();

        const hunkLines = h.split('\n');
        // For now, a simple algo that doesn't check first and last line, or content:
        const removedLines = hunkLines.filter(l => l.trim().startsWith('-'));
        const addedLines = hunkLines.filter(l => l.trim().startsWith('+'));

        const hasReferenceToPreviousCode = removedLines.length > addedLines.length && addedLines.length <= 2 && addedLines.some(al => commonCommentStartInDifferentLanguages.some(comment => al.trim().substring(1).trim().startsWith(comment)) &&
            unachieverHints.some(comment => al.trim().substring(1).toLowerCase().trim().indexOf(comment) > -1)); // To stay safe, for now, we only check for some hint before reverting

        hasAtLeastOneReferenceToPreviousCode = hasAtLeastOneReferenceToPreviousCode || hasReferenceToPreviousCode;

        console.log('!!! debug !!! Had reference to previous code!!!');

        const discriminate = hasReferenceToPreviousCode ? '+' : '-';
        const linesToKeep = hunkLines
            .filter(l => !l.trim().startsWith(discriminate)).map(l => (l.startsWith('-') || l.startsWith('+')) ? l.substring(1) : l.substring(1));
        newFileLines.push(...linesToKeep);
    }

    return hasAtLeastOneReferenceToPreviousCode
        ? newFileLines.join('\n').trim()
        : nextFileContent.trim();
}

// This is a fall back if the first repair didn't work
// This check was formerly done AFTER the write command, but now we don't want to overwrite the file with stoopid content.
export function findReferenceToPreviousCode(fileContent) {
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
