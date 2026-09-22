import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { RuntimeData, SanitizedUser, User } from '../types/index.js';
import { atomicWriteJsonFile, readJsonFile } from '../utils/atomicFileWriter.js';
import { generateInitialSeedData } from '../utils/seedData.js';

// Resolve data directory relative to project root
const DATA_DIR = path.resolve(process.cwd(), 'data');
const RUNTIME_FILE = path.join(DATA_DIR, 'runtime.json');

export class PersistenceService {
  private static isInitialized = false;

  public static async init(): Promise<void> {
    if (this.isInitialized) return;

    if (!fs.existsSync(RUNTIME_FILE)) {
      const seedData = await generateInitialSeedData();
      await atomicWriteJsonFile(RUNTIME_FILE, seedData);
    } else {
      // Validate file integrity
      try {
        await readJsonFile<RuntimeData>(RUNTIME_FILE);
      } catch (err) {
        const seedData = await generateInitialSeedData();
        await atomicWriteJsonFile(RUNTIME_FILE, seedData);
      }
    }
    this.isInitialized = true;
  }

  public static async getData(): Promise<RuntimeData> {
    await this.init();
    return readJsonFile<RuntimeData>(RUNTIME_FILE);
  }

  public static async updateData(
    mutator: (data: RuntimeData) => RuntimeData | Promise<RuntimeData>
  ): Promise<RuntimeData> {
    await this.init();
    const currentData = await readJsonFile<RuntimeData>(RUNTIME_FILE);
    const updatedData = await mutator(currentData);
    await atomicWriteJsonFile(RUNTIME_FILE, updatedData);
    return updatedData;
  }

  public static sanitizeUser(user: User): SanitizedUser {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  public static async purgeUserSessions(userId: string): Promise<void> {
    await this.updateData((data) => {
      data.sessions = data.sessions.filter((s) => s.userId !== userId);
      return data;
    });
  }

  public static async cleanExpiredSessions(): Promise<void> {
    const now = new Date().toISOString();
    await this.updateData((data) => {
      data.sessions = data.sessions.filter((s) => s.expiresAt > now);
      return data;
    });
  }
}
