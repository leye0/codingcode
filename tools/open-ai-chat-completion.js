// @ts-check
import axios from 'axios';
import { functions } from '../functions';

export async function getChatCompletion(messages, model = 'gpt-4-0613', withFunctions = false) {//  'gpt-4-0613') {
    const openai = axios.create({
        baseURL: "https://api.openai.com/v1",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
    });
    const requestBody = {
        model,
        temperature: Number(process.env.GPT_TEMPERATURE),
        messages,
    };
    if (withFunctions) {
        requestBody.functions = functions;
    }

    withFunctions
    const response = await openai.post("/chat/completions", requestBody);
    return response;
}