import { mkdirSync } from 'fs';

export function createPathRecursive(path) {
    const dirPath = path.split('/').slice(0, -1).join('/');
    if (dirPath.trim().length) {
        mkdirSync(dirPath, { recursive: true });
    }
}