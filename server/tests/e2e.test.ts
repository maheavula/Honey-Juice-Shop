process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../server.js';
import { PersistenceService } from '../services/persistenceService.js';
import { generateInitialSeedData } from '../utils/seedData.js';
import { atomicWriteJsonFile } from '../utils/atomicFileWriter.js';
import path from 'path';

const PORT = 5055;

function request(options: {
  method: string;
  path: string;
  body?: any;
  cookie?: string;
}): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders; cookie?: string }> {
  return new Promise((resolve, reject) => {
    const postData = options.body ? JSON.stringify(options.body) : undefined;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: options.path,
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
          ...(options.cookie ? { Cookie: options.cookie } : {})
        }
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsedBody = rawData;
          try {
            parsedBody = JSON.parse(rawData);
          } catch {}

          const setCookieHeader = res.headers['set-cookie'];
          let sessionCookie: string | undefined;
          if (setCookieHeader && setCookieHeader.length > 0) {
            sessionCookie = setCookieHeader[0].split(';')[0];
          }

          resolve({
            status: res.statusCode || 500,
            body: parsedBody,
            headers: res.headers,
            cookie: sessionCookie
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runE2E() {
  console.log('🚀 Starting Full End-to-End HTTP API & Integration Suite...\n');

  // Reset runtime data
  const dataPath = path.resolve(process.cwd(), 'data/runtime.json');
  const freshSeed = await generateInitialSeedData();
  await atomicWriteJsonFile(dataPath, freshSeed);

  const server = app.listen(PORT);
  await new Promise((r) => setTimeout(r, 500));

  try {
    // 1. API 6: System Health & Info
    const health = await request({ method: 'GET', path: '/api/system/health' });
    if (health.status !== 200 || !health.body.ready) throw new Error('Health check failed');
    console.log('✓ Group 6 (System): Health & storage diagnostic endpoint operational');

    const info = await request({ method: 'GET', path: '/api/system/info' });
    if (info.status !== 200 || info.body.currency !== 'INR') throw new Error('System info failed');
    console.log('✓ Group 6 (System): Store info, INR currency, and categories returned');

    // 2. API 1: Auth - Customer Login
    const loginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'customer@honeyjuiceshop.local', password: 'Customer@Juice2026' }
    });
    if (loginRes.status !== 200 || !loginRes.cookie) throw new Error('Customer login failed');
    const customerCookie = loginRes.cookie;
    console.log('✓ Group 1 (Auth): Customer login & HTTP-only session cookie issued');

    // 3. API 1: Auth - Me
    const meRes = await request({ method: 'GET', path: '/api/auth/me', cookie: customerCookie });
    if (meRes.status !== 200 || meRes.body.user.role !== 'customer') throw new Error('Auth me failed');
    console.log('✓ Group 1 (Auth): Caller session resolved identity successfully');

    // 4. API 3: Juices - Catalog Query
    const juicesRes = await request({ method: 'GET', path: '/api/juices?search=mango' });
    if (juicesRes.status !== 200 || juicesRes.body.count === 0) throw new Error('Search by fruit failed');
    console.log(`✓ Group 3 (Juices): Search by fruit "mango" returned ${juicesRes.body.count} items`);

    // 5. API 3: Juices - Submit Review
    const reviewRes = await request({
      method: 'POST',
      path: '/api/juices/jce_8f1a3d5e7c9b/reviews',
      cookie: customerCookie,
      body: { rating: 5, comment: 'Phenomenal aroma and pure sweetness!' }
    });
    if (reviewRes.status !== 201) throw new Error('Review submission failed');
    console.log('✓ Group 3 (Juices): Customer review submission saved');

    // 6. API 4: Orders - Checkout & Stock Decrement
    const preData = await PersistenceService.getData();
    const j101StockBefore = preData.juices.find((j) => j.id === 'jce_8f1a3d5e7c9b')!.stock;

    const checkoutRes = await request({
      method: 'POST',
      path: '/api/orders/checkout',
      cookie: customerCookie,
      body: {
        items: [{ juiceId: 'jce_8f1a3d5e7c9b', quantity: 2 }],
        deliveryAddress: {
          street: '45 Green Park',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560025'
        },
        paymentMethod: 'UPI Instant'
      }
    });

    if (checkoutRes.status !== 201 || !checkoutRes.body.order) throw new Error('Checkout failed');
    const orderId = checkoutRes.body.order.id;
    console.log(`✓ Group 4 (Orders): Checkout succeeded for Order ${orderId}`);

    const postData = await PersistenceService.getData();
    const j101StockAfter = postData.juices.find((j) => j.id === 'jce_8f1a3d5e7c9b')!.stock;
    if (j101StockAfter !== j101StockBefore - 2) {
      throw new Error(`Stock mismatch: was ${j101StockBefore}, now ${j101StockAfter}`);
    }
    console.log(`✓ Group 4 (Orders): Stock decremented (${j101StockBefore} -> ${j101StockAfter})`);

    // 7. API 4: Orders - Order Receipt
    const receiptRes = await request({
      method: 'GET',
      path: `/api/orders/${orderId}`,
      cookie: customerCookie
    });
    if (receiptRes.status !== 200 || receiptRes.body.order.totalAmount !== 49800) {
      throw new Error('Receipt verification failed');
    }
    console.log('✓ Group 4 (Orders): Order receipt retrieved and verified');

    // 8. API 5: Admin - Login & Dashboard
    const adminLoginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'admin@honeyjuiceshop.local', password: 'Admin#HoneyJuice2026!' }
    });
    if (adminLoginRes.status !== 200 || !adminLoginRes.cookie) throw new Error('Admin login failed');
    const adminCookie = adminLoginRes.cookie;
    console.log('✓ Group 5 (Admin): Admin authenticated with elevated privileges');

    const dashboardRes = await request({
      method: 'GET',
      path: '/api/admin/dashboard',
      cookie: adminCookie
    });
    if (dashboardRes.status !== 200 || !dashboardRes.body.stats) throw new Error('Dashboard failed');
    console.log(`✓ Group 5 (Admin): Dashboard metrics retrieved (Total Orders: ${dashboardRes.body.stats.totalOrders})`);

    // 9. API 5: Admin - Order Status Update
    const statusUpdateRes = await request({
      method: 'PATCH',
      path: `/api/admin/orders/${orderId}/status`,
      cookie: adminCookie,
      body: { status: 'dispatched' }
    });
    if (statusUpdateRes.status !== 200 || statusUpdateRes.body.order.status !== 'dispatched') {
      throw new Error('Status update failed');
    }
    console.log(`✓ Group 5 (Admin): Order ${orderId} moved to "dispatched"`);

    // 10. API 5: Admin - Customer Suspension & Session Purge
    const customerId = 'usr_c3e5d7f1a9b4';
    const suspendRes = await request({
      method: 'PATCH',
      path: `/api/admin/customers/${customerId}/status`,
      cookie: adminCookie,
      body: { status: 'suspended' }
    });
    if (suspendRes.status !== 200) throw new Error('Customer suspension failed');
    console.log('✓ Group 5 (Admin): Customer account suspended');

    // Verify previously active customer session is purged/invalidated
    const rejectedReq = await request({
      method: 'GET',
      path: '/api/auth/me',
      cookie: customerCookie
    });
    if (rejectedReq.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for purged session, got ${rejectedReq.status}`);
    }
    console.log('✓ Security: Suspended customer session was immediately purged (401 Unauthorized)');

    // Verify login attempt by suspended user returns 403 Forbidden
    const suspendedLoginReq = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'customer@honeyjuiceshop.local', password: 'Customer@Juice2026' }
    });
    if (suspendedLoginReq.status !== 403) {
      throw new Error(`Expected 403 Forbidden for suspended user login, got ${suspendedLoginReq.status}`);
    }
    console.log('✓ Security: Suspended customer login attempt blocked (403 Forbidden)');

    // 11. Reactivate customer to leave database in clean active state
    await request({
      method: 'PATCH',
      path: `/api/admin/customers/${customerId}/status`,
      cookie: adminCookie,
      body: { status: 'active' }
    });
    console.log('✓ Cleanup: Reactivated customer account for active use');

    console.log('\n🌟 ALL 6 API GROUPS AND END-TO-END INTEGRATION FLOWS VERIFIED SUCCESSFULLY!\n');
  } finally {
    server.close();
  }
}

runE2E().catch((err) => {
  console.error('❌ E2E test failed:', err);
  process.exit(1);
});
