// @ts-check
import { parseCommands } from "../commands";

export class CleanMessages {
    static removeDuplicateFileRead(messages, path, instancesOfFileToKeep) {
        // Only keep the last version of a file if displayed multiple times
        const str = '/WRITE_COMMAND ' + path.trim();
        let idx = 0;
        for (let i = messages.length - 2; i >= 0; i--) {
            let m = messages[i];
            if (m.content.indexOf(str) > -1) {
                idx++;
                if (idx > instancesOfFileToKeep) {
                    // console.log('debug. removed duplicas for =>' + str + '<=');
                    // console.log('content was:', m.content);
                    m.content = m.content.substring(0, m.content.indexOf(str)) || '';
                    console.log('removed write content duplicate for', path.trim());
                }
            }
        }

        if (idx > instancesOfFileToKeep) {
            console.log('Messages were cleaned for duplicates file ' + path);
        }


        ////// This part does not work. Code it better.

        // Now, we need to concatenate subsequent REASONINGS so that the whole discussion don't become just reasonings:

        // for (let i = 0; i < messages.length; i++) {
        //     let message = messages[i];
        //     const cmdFound = parseCommands(message.content);
        //     if (cmdFound.length === 1 && cmdFound[0].name === '/REASONING_COMMAND') {
        //         console.log('d2: ' + i + ', found a message that is reasonning only');
        //         message.reasoningOnly = true;
        //     }
        //     if (i > 0) {
        //         if (messages[i - 1].reasoningOnly) {
        //             // Concatenate
        //             let previousCmd = parseCommands(messages[i - 1].content)[0];
        //             if (!previousCmd) { continue; }

        //             let previousReasoning = previousCmd.parameters.join(' ');
        //             if (!cmdFound[0]) { continue; }

        //             let nextReasoning = cmdFound[0].parameters.join(' ');
        //             let concatenatedReasonings = previousReasoning + ' ' + nextReasoning;
        //             messages[i - 1].content = '';
        //             messages[i - 1].delete = true;
        //             console.log('d2 previous reasoning: ', previousReasoning);
        //             console.log('d2 next     reasoning: ', nextReasoning);

        //             console.log('d2 message ' + (i - 1) + ' is reasoning only, will delete it and concatenate into next message');
        //             messages[i].content = '/REASONING_COMMAND ' + concatenatedReasonings;
        //             console.log('d2 message ' + (i) + ' went from ' + previousReasoning.length + ' to ' + concatenatedReasonings.length);

        //         }
        //     }
        // }
        // for (let i = 0; i < messages.length; i++) {
        //     let message = messages[i];
        //     delete message.reasoningOnly;
        // }

        // console.log('Before removing -> Messages length=' + messages.length);
        // messages = messages.filter((m) => !m.delete);
        // console.log('After removing -> Messages length=' + messages.length);
        return messages;
    }

    static removeFileNotFoundErrors(messages) {
        // Only keep the last version of a file if displayed multiple times
        let messageList = [];
        const uselessMessages = ['Error: No such file', 'made an error in the file path'];
        for (let i = messages.length - 1; i >= 0; i--) {
            let message = messages[i];
            if (!uselessMessages.some(str => message.content.indexOf(str) > -1)) {
                messageList.push(message);
            } else {
                console.log('remove a file not found message');
            }
        }

        return messageList.reverse();
    }

    // Remove all the search/browse process as it doesn't contain any information.
    static removeGoogleSearchResults(messages) {
        let messageList = [];
        for (let i = 0; i < messages.length; i++) {
            let message = messages[i];
            const cmdFound = parseCommands(message);

            let skip = false;
            for (let cmd of cmdFound) {
                if (cmd.name === '/SEARCH_COMMAND') {
                    skip = true;
                }
                if (cmd.name === '/BROWSE_COMMAND') {
                    skip = true;
                }
            }

            if (message.content.indexOf('Results are: ') === 0) {
                skip = true;
            }

            if (!skip) {
                messageList.push(message);
            }
        }

        return messageList;
    }
}
