// @ts-check
import { readFileSync, mkdirSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import * as path from 'path';
import {
    runShellCommand,
    sleep,
    searchGoogle,
    renameFile,
    ask,
    createPathRecursive,
    readFileContent,
    getPageContent,
    findImage,
    dir,
    setSessionAction,
    setSessionWorkspace,
    setSessionTokens,
    findReferencesToPreviousCode,
} from './tools';
import { join } from 'path';
import * as rl from 'node:readline';
import * as dotenv from 'dotenv';
import { getChatCompletion } from './tools/open-ai-chat-completion';
import { Color } from './tools/colors';
import { codeRebuilder } from './tools/code-rebuilder';
import { deleteFolderRecursive } from './tools/delete-folder';

async function main() {
    dotenv.config();

    let retries = 0;
    let currentResult = '';
    let continuing = false;
    let sessionContext = {
        action: '',
        workspace: '',
        tokens: 0,
    }

    const readLineInterface = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    let sessionId = new Date().getTime();
    const session = []; // array of message array, to remember everything that is sent, because message cleanup/filtering will happen (step 4)
    let requirements = '';

    let messages = [
        { role: 'system', content: readFileSync('./system.txt', 'utf8') }
    ];
    let messagesThatCanBeDiscarded = [];

    const allWorkspacesDirectory = path.join(process.cwd(), 'workspaces');

    const workspaceName = await ask(readLineInterface, 'Project name [filename without spaces]? ');
    setSessionWorkspace(workspaceName, sessionContext);
    const sessionPath = allWorkspacesDirectory + '/' + workspaceName + '-' + sessionId + '.log'
    const workspaceDirectory = path.join(allWorkspacesDirectory, workspaceName);

    if (!existsSync('./workspaces')) {
        mkdirSync('workspaces');
    }
    if (!existsSync(path.join('workspaces', workspaceName))) {
        mkdirSync(join('workspaces', workspaceName));
    } else {
        const toContinue = await ask(readLineInterface, 'Continue existing project (yes or no)? ');
        if (toContinue.indexOf('y') === 0) {
            continuing = true;
        } else {
            deleteFolderRecursive(path.join(allWorkspacesDirectory, workspaceName));
            const sessionFile = readdirSync(allWorkspacesDirectory).find(f => path.basename(f).indexOf(workspaceName + '-') === 0);
            if (sessionFile) {
                unlinkSync(path.join(allWorkspacesDirectory, sessionFile));
            }
            mkdirSync(join('workspaces', workspaceName));
        }
    }

    process.chdir(workspaceDirectory);

    function write(path, content) {
        try {
            if (!path) {
                console.log('WRITE_FILE empty path');
                return; // NOTE: When it happens, it is sometime a mention of the command without any usage. 
            }
            createPathRecursive(path);
            writeFileSync(path, content);
            return true;
        } catch (err) {
            addMessage('user', 'error: ' + err);
            return false;
        }
    }

    async function createChatCompletion(messages) {
        try {
            // let isComplete = false;
            // while (!isComplete) {
            const response = await getChatCompletion(messages, 'gpt-4-0613', true);
            // currentResult += response.data.choices[0].message.function_call;
            const functionCall = response.data.choices[0].message.function_call;

            // isComplete = response.data.choices[0].finish_reason === 'function_call';
            // Here I naively take for grant there will be no "content" message.
            const currentTokens = response.data.usage.total_tokens;
            setSessionTokens(currentTokens, sessionContext)
            // }

            retries = 0;

            // if (result) {
            // const message = result;
            // result = '';
            // await applyCommands(message);
            if (functionCall) {
                await applyCommands(functionCall);
            }

            // }

        } catch (error) {
            let gptError = error?.response?.data?.error ?? error?.response?.data ?? error?.response;
            if (gptError) {
                if (gptError.code === 'context_length_exceeded') {
                    console.log('The maximum context length is reached');
                    // EXPERIMENTAL !!!!!!!!
                    // Only keep the first, the second and the last message.
                    clearContext();
                }
            } else {
                console.log(error);
            }
            retries++;
            if (retries > 24) {
                console.log('Cannot reach OpenAI API.');
                console.log('Exit');
                process.exit(0);
            }
            console.log(`${Color.red}Error with OpenAI API:${JSON.stringify(gptError, null, 4)}\n\nWill retry in 15 seconds${Color.reset}`,);
            setSessionAction('Retry in 15s to call OpenAI API', sessionContext);
            await sleep(15000);
        }
    }

    function clearContext() {
        messages = [messages[0], messages[1], ...messages.slice(messages.length - 2)];
    }

    function addMessage(role, content, isMessageThatCanBeDiscarded = false) {
        const message = {
            role: role,
            content: content
        };

        if (isMessageThatCanBeDiscarded) {
            messagesThatCanBeDiscarded.push(JSON.stringify(message));
        }

        if (!content.trim()) {
            return;
        }

        const roleSettings = {
            user: {
                color: 'blue'
            },
            assistant: {
                color: 'green'
            }
        }
        console.log(Color[roleSettings[role].color] + role + ': ' + content + Color.reset);
        messages.push(message);
    }

    async function applyCommands(functionCall) {
        const name = functionCall.name;
        const args = JSON.parse(functionCall.arguments);

        setSessionAction(args.reason, sessionContext);

        if (name === 'SEARCH_COMMAND') {
            console.log('Google search query: ', args.query);
            const results = await searchGoogle(args.query);
            if (results.length === 0) {
                addMessage('user', 'There is no results on Google for this query');
            } else {
                addMessage('user', 'Results are: \n\n' + JSON.stringify(results, null, 4) + '\n\Use the BROWSE_COMMAND {url} to open and read one of the result by specifying the exact url in the result that interests you.');
            }
        }

        if (name === 'BROWSE_COMMAND') {
            const content = await getPageContent(args.url);
            const markdown = NodeHtmlMarkdown.translate(content);

            // GPT-3 stuff:
            const cleanPrompt = 'Cleanup the following text to only keep information and remove repetitive links or useless stuff:\n' + markdown;
            const cleanMessages = [{ role: 'user', content: cleanPrompt }];
            const cleanResult = await getChatCompletion(cleanMessages);
            let cleanMarkdown = JSON.stringify(cleanResult.data.choices[0].message.content);
            addMessage('user', 'Web page content is:\n' + cleanMarkdown)
        }

        if (name === 'DIR_COMMAND') {
            const projectFileStructure = await dir(workspaceDirectory);
            addMessage('user', `Here is the full file structure of the project, starting from project root.\n\n${projectFileStructure}\n\nYou are currently in the folder: ${process.cwd()}`);
        }

        if (name === 'WRITE_COMMAND') {
            let writeRetries = 0;
            while (true) {
                const fileExists = existsSync(args.path);
                // TODO: re-implement
                // const forgotToReadBefore = fileExists && !messages.some((m) => m.content.indexOf(`READ_COMMAND ${path}`));
                const previousFileContent = fileExists ? await readFileContent(args.path, workspaceDirectory) : undefined;
                let nextFileContent = args.file_content.replace(/```js/g, '');
                nextFileContent = nextFileContent.replace(/```javascript/g, '');
                nextFileContent = nextFileContent.replace(/```html/g, '');
                nextFileContent = nextFileContent.replace(/```/g, '');

                // First check: try to repair the file if there are any regression.
                const referencesToPreviousCode = findReferencesToPreviousCode(nextFileContent); // If there are still bad coder lines (reference to old code), which is unlikely to happen, then we will act upon it.

                // TODO: Replace by a new thread of GPT-4 (or even GPT-3.5 16k with all files then instructions).
                if (referencesToPreviousCode.length) {
                    console.log('Warning: Code has been rebuilt from a merge between previous file and incomplete GPT.');
                    nextFileContent = await codeRebuilder(previousFileContent, nextFileContent);
                }

                try {
                    const findUnimplementedCode = await getChatCompletion([{ role: 'user', content: `Here is a code. Make a numbered list of all places where the code indicates that there is unimplemented or missing code that need to be written. If it is OK, just write "OK" as your answer.\n\n${nextFileContent}` }]);
                    if (findUnimplementedCode.data.choices[0].message.content.toLowerCase().indexOf('ok') < 0) {
                        addMessage('user', `Revise the file you just wrote. It seems that either you did not implement everything or you removed some parts. Please implement everything listed. If everything you can implement is implemented or you need to implement it later, then do it later. If you are totally done with the whole project, then use the DONE_COMMAND. Here is the file:\n\n${nextFileContent}\n\nHere are the problematic detect parts:\n\n${findUnimplementedCode.data.choices[0].message.content}`);
                    } else {
                        write(args.path, nextFileContent); // Write is ok should be used to check if the writing process was ok 
                        addMessage('user', `Ok. You are done with step: "${args.reason}". File ${args.path} written with content:\n\n${nextFileContent}\n\nContinue to next step.`);
                        break; // Stop loops
                    }
                } catch (error) {
                    writeRetries++;
                    if (writeRetries > 2) {
                        console.log('Could not write file. Trying to continue with the rest.');
                        break;
                        return;
                    }
                    console.log('Some GPT calls to write file failed')
                    await sleep(15000);
                }
            }
        }

        if (name === 'READ_COMMAND') {
            const fileContent = await readFileContent(args.path, workspaceDirectory);
            addMessage('user', fileContent);
        }

        if (name === 'FINDIMAGE_COMMAND') {
            findImage(args.description, args.path, args.image_width, args.image_height).then((ok) => {
                if (ok) {
                    addMessage('user', `image ${prompt} written at ${args.path}`);
                } else {
                    addMessage('user', `image ${prompt} could not be found on DALL-E or written at ${args.path}`);
                }
            });
        }

        if (name === 'ASK_COMMAND') {
            const responseToAssistantQuestion = await ask(readLineInterface, `The assistant is asking you this question:\n${args.question}`);
            addMessage('user', responseToAssistantQuestion);
        }

        if (name === 'RENAME_COMMAND') {
            await renameFile(args.old_path, args.new_path);
        }

        if (name === 'CMD_COMMAND') {
            try {
                try {
                    await runShellCommand(args.command, addMessage), sessionContext;
                } catch (err) {
                    console.log(err);
                    // TODO: Don't know why yet but some errors in the runShellCommand are crashing the app.
                }

            } catch (err) {
                const projectFileStructure = await dir(workspaceDirectory);
                addMessage('user', 'Error when running command: ' + err);
                addMessage('user', 'Please note that the command was executed in this folder: ' + process.cwd() + ' The current project file structure is:\n\n' + projectFileStructure);

                // If it was not intented to be executed in this folder, please change the folder accordingly.');
            }
            setSessionAction('Ready.', sessionContext);
        }

        if (name === 'DONE_COMMAND') {
            const improvements = await ask(readLineInterface, 'Agent is done. AT USER: Any improvements to bring on the final result? Take the time to review the result and write improvements to do here. ');
            if (improvements) {
                addMessage('user', improvements + ' Once you are done with that, launch the DONE_COMMAND.');
            } else {
                console.log('Finished.');
                process.exit(0);
            }
        }
    }

    setSessionAction('Ready.', sessionContext);

    try {

        if (!continuing) {
            // Initializing project

            const projectDescription = await ask(readLineInterface, '\nWhat do you want to develop? Describe it in details because there is no telepathy between you and the GPT model, and GPT does not always -really- know: ');
            console.log('');

            const requirementPrompt = `You will do the following: ${projectDescription}\n\nI want you to display how you would achieve this goal perfectly by breaking it into multiple steps. Each step should contain only one step and/or command. Only one thing to do or execute. List them as:\n1. [description of the step]\n2. [ description of the step]\netc.`;
            const initialMessages = [{ role: 'user', content: requirementPrompt }];

            setSessionAction('Initializing project...', sessionContext);
            const initialResponse = await getChatCompletion(initialMessages);
            requirements = initialResponse.data.choices[0].message.content;
            // TODO: Make it write requirements as it is written by a machine, with its limitations.
            console.log('Requirements are:\n\n' + requirements);
            console.log('');

            const stepsToExclude = await ask(readLineInterface, 'Are there steps you want to exclude? List them or leave it blank: ');
            console.log('');

            const stepsToInclude = await ask(readLineInterface, 'Are there steps missing that you want to include (i.e. 1. Install xyz) ? List them or leave it blank: ');
            console.log('');

            if (stepsToExclude) {
                const requirementsWithExcludedSteps = await getChatCompletion([{ role: 'user', content: 'I have this list of steps:\n' + requirements + '\n\nI want you to remove these steps: ' + stepsToExclude }]);
                requirements = requirementsWithExcludedSteps.data.choices[0].message.content;
            }

            if (stepsToInclude) {
                const requirementsWithIncludedSteps = await getChatCompletion([{ role: 'user', content: 'I have this list of steps:\n' + requirements + '\n\nI want you to add these steps: ' + stepsToInclude }]);
                requirements = requirementsWithIncludedSteps.data.choices[0].message.content;
            }

            // Starting project...
            addMessage('user', projectDescription + '\n' + requirements + '\n');

            setSessionAction('Ready.', sessionContext);

        } else {
            // Continue project
            const directoryPath = './..';
            const files = readdirSync(directoryPath)
                .filter(file => file.startsWith(workspaceName + '-'))
                .sort();
            const projectFile = files[files.length - 1];
            sessionId = Number(projectFile.split('-')[1].replace('.log', ''));
            const lastStateOfProject = JSON.parse(readFileSync(path.join(directoryPath, projectFile), 'utf-8'));
            const lastMessages = lastStateOfProject[lastStateOfProject.length - 1]?.messages || [];
            messages = lastMessages;

            const newInstruction = await ask(readLineInterface, 'New instruction? (leave blank if none) ');
            if (newInstruction) {
                messages.push({ 'role': 'user', 'content': newInstruction })
            }

            const keepOnlyRequirementsAndLastInstruction = await ask(readLineInterface, 'Keep only requirements and last instruction to save tokens and $ (yes or no)? ');
            if (keepOnlyRequirementsAndLastInstruction.indexOf('y') === 0) {
                clearContext();
            }
        }

        while (true) {
            writeFileSync(sessionPath, JSON.stringify(session, null, 4));

            await createChatCompletion(messages);

            session.push({ date: new Date().getTime(), messages });
            // await ask(readLineInterface, 'Pause...');

            // For now, slow start, so that CLI have time to create files
            await messages.length < 4 ? sleep(15000) : sleep(3000);
        }
    } catch (err) {
        console.log(err);
        console.log(err?.response?.data?.error);
    }
}

main();
