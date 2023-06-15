// @ts-check
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}