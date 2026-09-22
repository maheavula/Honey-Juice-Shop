import path from 'path';
import fs from 'fs';
import { generateInitialSeedData } from './seedData.js';
import { atomicWriteJsonFile } from './atomicFileWriter.js';

async function seed() {
  const dataPath = path.resolve(process.cwd(), 'data/runtime.json');
  console.log('🌱 Forcing re-seed of runtime.json...');
  const seedData = await generateInitialSeedData();
  await atomicWriteJsonFile(dataPath, seedData);
  console.log('✅ Seed complete. Created fresh data/runtime.json');
}

seed().catch(console.error);
