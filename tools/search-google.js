// @ts-check
import axios from 'axios';

export async function searchGoogle(query) {
    const GOOGLE_CUSTOM_SEARCH_API_KEY = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const GOOGLE_CUSTOM_SEARCH_ENGINE_ID = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
    const maxResults = 10;
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CUSTOM_SEARCH_API_KEY}&cx=${GOOGLE_CUSTOM_SEARCH_ENGINE_ID}&q=${query}&num=${maxResults}`;

    try {
        const response = await axios.get(url);
        return response.data.items.map((res) => ({ summary: res.snippet, url: res.link }));
    } catch (error) {
        console.log('Google search error: ', error);
        return [];
    }
}