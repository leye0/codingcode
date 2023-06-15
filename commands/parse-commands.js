// @ts-check
const commands = ['/FINDIMAGE_COMMAND', '/ASK_COMMAND', '/SEARCH_COMMAND', '/BROWSE_COMMAND', '/DIR_COMMAND', '/WRITE_COMMAND', '/READ_COMMAND', '/CMD_COMMAND', '/REASONING_COMMAND', '/DONE_COMMAND'];

export function parseCommands(message) {

    let cmdFound = [];
    for (let command of commands) {
        cmdFound.push(...findAllCommands(message, command));
    }
    cmdFound = cmdFound.sort((a, b) => a.start < b.start ? -1 : 1);

    if (cmdFound.length > 0) {
        for (let i = 0; i < cmdFound.length; i++) {
            let cmd = cmdFound[i];
            if (i === cmdFound.length - 1) {
                cmd.end = message.length;
            } else {
                cmd.end = cmdFound[i + 1].start;
            }

            cmd.parameters = message.substring(cmd.start, cmd.end).split('\n')[0].split(' ').slice(1);
            cmd.content = message.substring(cmd.start, cmd.end).split('\n').slice(1).join('\n');
        }
    }

    return cmdFound;
}

function findAllCommands(message, stringToFind) {
    let startingPositions = [];
    let currentPosition = message.indexOf(stringToFind);

    while (currentPosition !== -1) {
        startingPositions.push({
            start: currentPosition,
            end: Number.MIN_VALUE,
            name: stringToFind,
            parameters: [],
            content: ''
        });
        currentPosition = message.indexOf(stringToFind, currentPosition + 1);
    }

    return startingPositions;
}