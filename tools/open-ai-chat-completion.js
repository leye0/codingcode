// @ts-check
import axios from 'axios';

export async function getChatCompletion(messages, model = 'gpt-4') {//  'gpt-4-0613') {
    const openai = axios.create({
        baseURL: "https://api.openai.com/v1",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
    });
    const response = await openai.post("/chat/completions", {
        model,
        temperature: Number(process.env.GPT_TEMPERATURE),
        messages,
    });
    return response;
}