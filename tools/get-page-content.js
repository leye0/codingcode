// @ts-check
import puppeteer from 'puppeteer';

export async function getPageContent(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({ headless: true, timeout: 20000 });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle0' });

            const content = await page.content();
            await browser.close();
            resolve(content);
        } catch (error) {
            reject(error);
        }
    });
}