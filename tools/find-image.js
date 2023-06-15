// @ts-check
import axios from 'axios';
import gm from 'gm';
import { createWriteStream, unlinkSync } from 'fs';
import path from 'path';
import { createPathRecursive } from './create-path-recursive';

const downloadImage = async (url, outputPath) => {
    const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream',
    });

    await response.data.pipe(createWriteStream(outputPath));

    return new Promise((resolve, reject) => {
        response.data
            .on('end', resolve)
            .on('error', reject);
    });
};

const writeImage = async (srcPathToSave, size) => {
    let imageMagick = gm.subClass({ imageMagick: true });
    return new Promise((resolve, reject) => {
        const extensionStart = srcPathToSave.lastIndexOf('.', srcPathToSave.lastIndexOf('/'));
        let destPathToSave = extensionStart > 0 ? srcPathToSave.substring(0, extensionStart) + '.png' : srcPathToSave + '.png';
        destPathToSave = path.join(process.cwd(), destPathToSave);

        let a = imageMagick(srcPathToSave); // API unchained for debugging purpose
        a = a.fuzz(10, true);
        a = a.transparent('white');
        a = a.trim();
        a = a.resize(size, size);
        a.write(destPathToSave.replace('.jpg', ''), (err) => {
            unlinkSync(srcPathToSave);
            if (err) {
                reject();
            }
            resolve('done');
        });
    });
};

export async function findImage(prompt, pathToSave, width, height) {
    // For now, we don't want .jpg, we want .png. Fix extension:
    prompt += ' on a white background';

    let dalleWidth = width;

    if (dalleWidth > 256) {
        dalleWidth = 512;
    }
    if (dalleWidth > 512) {
        dalleWidth = 1024;
    }
    if (dalleWidth < 256) {
        dalleWidth = 256;
    }
    let dalleHeight = dalleWidth;
    try {
        // Call the OpenAI API with necessary parameters
        const config = {
            method: 'post',
            url: 'https://api.openai.com/v1/images/generations',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            data: {
                // model: 'image-alpha-001',
                prompt,
                n: 1,
                size: `${dalleWidth}x${dalleHeight}`,
            },
        };

        const response = await axios(config);

        // Handle API response
        if (response.data && response.data.data && response.data.data.length > 0) {
            const imageUrl = response.data.data[0].url;
            console.log(imageUrl);
            pathToSave += '.jpg';
            console.log(pathToSave);
            createPathRecursive(pathToSave);
            await downloadImage(imageUrl, pathToSave);
            await writeImage(pathToSave, width);
            return true;
        }
    } catch (err) {
        console.log(err);
        console.log('ERROR'); // TODO: return error feedback
        return false;
    }
}