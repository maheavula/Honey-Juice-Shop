import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class MutexQueue {
  private queue: Promise<any> = Promise.resolve();

  public run<T>(task: () => Promise<T>): Promise<T> {
    const result = this.queue.then(() => task(), () => task());
    this.queue = result.catch(() => {});
    return result;
  }
}

const fileMutex = new MutexQueue();

/**
 * Atomically writes data to a target JSON file by writing to a temporary file
 * and then renaming it.
 */
export async function atomicWriteJsonFile<T>(filePath: string, data: T): Promise<void> {
  return fileMutex.run(async () => {
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });

    const tempFileName = `${path.basename(filePath)}.tmp.${crypto.randomBytes(8).toString('hex')}`;
    const tempFilePath = path.join(dir, tempFileName);

    const jsonString = JSON.stringify(data, null, 2);

    try {
      await fs.promises.writeFile(tempFilePath, jsonString, 'utf-8');
      // On Windows, rename fails if destination file is locked or open in some cases,
      // but with fs.promises.rename in Node.js v22 it does atomic replace.
      // To be completely robust across Windows environments, we retry if transiently busy.
      let retries = 5;
      while (retries > 0) {
        try {
          await fs.promises.rename(tempFilePath, filePath);
          break;
        } catch (err: any) {
          retries--;
          if (retries === 0) throw err;
          await new Promise(r => setTimeout(r, 50));
        }
      }
    } catch (error) {
      if (fs.existsSync(tempFilePath)) {
        try {
          await fs.promises.unlink(tempFilePath);
        } catch {}
      }
      throw error;
    }
  });
}

/**
 * Reads a JSON file safely.
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}
