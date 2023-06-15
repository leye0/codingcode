// @ts-check

import { getChatCompletion } from "./open-ai-chat-completion";

export async function codeRebuilder(previousCode, newCode) {
    const prompt = `Combine the Version 1 and Version 2 of the content of 'file1.js' as provided below by mashing up the two files together, maintaining the full content from both files by replacing placeholders that reference to Previous version 1 content with the actual previous content. Remove comments about reference to previous code. Produce a file that is a combination of version 1 and version 2file content. But in the Resulting file, all comments that are referring to the code from the previous file content should be actually replaced with the real previous code.\n\Version 1 file:\n\n${previousCode}\n\Version 2 file:\n\n${newCode}\n\nPrint the Version 3 final content which is the mashup of both files`;
    const response = await getChatCompletion([{ role: 'user', content: prompt }]);

    let content = response.data.choices[0].message.content;
    content = content.replace(/```js/g, '');
    content = content.replace(/```javascript/g, '');
    content = content.replace(/```html/g, '');
    content = content.replace(/```/g, '');
    return content;
}


// Previous prompt was:
// const prompt = `Combine the old and new content a file as provided below by mashing up the two files together, maintaining the full content from both files by replacing placeholders that reference to previous content with the said previous content. Remove comments about reference to old code.\n\Previous file version:\n\n${previousCode}\n\nNew file version:\n\n${newCode}`;
// Combine the Version 1 and Version 2 of the content of 'file1.js' as provided below by mashing up the two files together, maintaining the full content from both files by replacing placeholders that reference to Previous version 1 content with the actual previous content. Remove comments about reference to previous code. Produce a file that is a combination of version 1 and version 2file content. But in the Resulting file, all comments that are referring to the code from the previous file content should be actually replaced with the real previous code.