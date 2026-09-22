import { PersistenceService } from '../services/persistenceService.js';
import { generateInitialSeedData } from '../utils/seedData.js';
import { atomicWriteJsonFile } from '../utils/atomicFileWriter.js';
import path from 'path';

async function runTests() {
  console.log('🧪 Starting Honey Juice Shop API & Engine Tests...\n');

  // 1. Reset test data
  const dataPath = path.resolve(process.cwd(), 'data/runtime.json');
  const seed = await generateInitialSeedData();
  await atomicWriteJsonFile(dataPath, seed);
  console.log('✓ 1. Initialized atomic runtime.json state');

  // 2. Test reading data
  const data = await PersistenceService.getData();
  if (data.juices.length !== 6) throw new Error(`Expected 6 juices, got ${data.juices.length}`);
  if (data.users.length !== 2) throw new Error(`Expected 2 users, got ${data.users.length}`);
  console.log('✓ 2. PersistenceService read 6 SKUs and 2 users successfully');

  // 3. Test money integer math
  const alphonso = data.juices.find(j => j.id === 'jce_8f1a3d5e7c9b');
  if (!alphonso || alphonso.price !== 24900) {
    throw new Error('Alphonso price should be 24900 paise');
  }
  console.log('✓ 3. Integer paise pricing verified (₹249.00 -> 24900)');

  // 4. Test atomic Mutex updates
  await PersistenceService.updateData((d) => {
    const j = d.juices.find(x => x.id === 'jce_8f1a3d5e7c9b')!;
    j.stock -= 2;
    return d;
  });

  const updatedData = await PersistenceService.getData();
  const updatedAlphonso = updatedData.juices.find(j => j.id === 'jce_8f1a3d5e7c9b');
  if (updatedAlphonso?.stock !== 43) {
    throw new Error(`Expected stock 43, got ${updatedAlphonso?.stock}`);
  }
  console.log('✓ 4. Atomic stock decrement verified (45 -> 43)');

  // 5. Test customer suspension session purge
  const customer = updatedData.users.find(u => u.id === 'usr_c3e5d7f1a9b4')!;
  // Add a fake session
  await PersistenceService.updateData(d => {
    d.sessions.push({
      id: 'SESS-test-123',
      userId: customer.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000000).toISOString()
    });
    return d;
  });

  // Purge sessions on suspension
  await PersistenceService.purgeUserSessions(customer.id);
  const dataAfterPurge = await PersistenceService.getData();
  const sessions = dataAfterPurge.sessions.filter(s => s.userId === customer.id);
  if (sessions.length !== 0) {
    throw new Error('Sessions should be empty after customer suspension/purge');
  }
  console.log('✓ 5. Customer suspension session purge verified');

  console.log('\n🎉 ALL BACKEND & ENGINE CHECKS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
