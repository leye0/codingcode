// @ts-check
import { renameSync } from 'fs';

export async function renameFile(oldPath, newPath) {
    await renameSync(oldPath, newPath);
}
