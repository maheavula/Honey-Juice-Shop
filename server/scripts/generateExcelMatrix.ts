import ExcelJS from 'exceljs';
import path from 'path';

async function generateMatrix() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Honey Juice Shop Security Engineering';
  workbook.lastModifiedBy = 'Honey Juice Shop Security Engineering';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Security Reference Matrix', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  worksheet.columns = [
    { header: 'S.No', key: 'sno', width: 8 },
    { header: 'Vulnerability Name', key: 'vulnName', width: 32 },
    { header: 'OWASP Top 10:2025 Category', key: 'owaspCat', width: 36 },
    { header: 'Difficulty Level', key: 'difficulty', width: 16 },
    { header: 'Steps to Reproduce / Verify', key: 'steps', width: 60 },
    { header: 'Impacts', key: 'impacts', width: 45 },
    { header: 'Remediation', key: 'remediation', width: 50 },
  ];

  const data = [
    {
      sno: 1,
      vulnName: 'Client-Authoritative Pricing on Order Checkout',
      owaspCat: 'A04:2025 - Insecure Design',
      difficulty: 'Easy',
      steps: `1. Log in to the application and add items (e.g., Cold-Pressed Juice "jce_8f1a3d5e7c9b") to the shopping cart.
2. In Burp Suite, turn Intercept ON under Proxy > Intercept.
3. Proceed through checkout and click the "Confirm and Pay" button.
4. In Burp Suite Proxy, intercept the outgoing POST /api/orders request.
5. In the JSON request body, locate the "items" array and the "totalAmount" parameter; modify "price" from 12.99 to 0.01 and "totalAmount" to 0.01, then Forward the request.
6. Observe HTTP 201 Created and confirm in GET /api/orders/my-orders that the order processed at the manipulated $0.01 price.`,
      impacts: `Direct financial loss due to unauthorized arbitrary price tampering; Complete invalidation of server-side billing integrity; Potential inventory depletion through mass purchase of zero-cost goods.`,
      remediation: `Enforce strictly server-side authoritative pricing lookup by resolving product IDs against the database record; Reject and strip any client-supplied "price" or "totalAmount" fields from the checkout payload; Validate subtotal, taxes, shipping, and discounts exclusively on the backend prior to payment execution.`
    },
    {
      sno: 2,
      vulnName: 'Insecure Direct Object Reference (IDOR) on Order Receipts',
      owaspCat: 'A01:2025 - Broken Access Control',
      difficulty: 'Easy',
      steps: `1. Authenticate as User A (e.g., "usr_c3e5d7f1a9b4") and complete an order to obtain an order identifier (e.g., "ord_6b8d0f2a4c6e").
2. Log out and authenticate as User B (a different non-administrative user).
3. In Burp Suite, send a GET /api/orders/ord_6b8d0f2a4c6e request to Burp Repeater using User B's session token.
4. Send the request and observe the server response.
5. Verify that HTTP 200 OK is returned containing User A's complete order details, including full customer name, delivery address, phone number, and purchased items.`,
      impacts: `Unauthorized disclosure of Personally Identifiable Information (PII); Exposure of confidential customer purchase history and address records; Violation of privacy compliance mandates (GDPR, CCPA).`,
      remediation: `Implement contextual authorization checks in the order retrieval handler to verify that the requesting user ID strictly matches the order's "userId" (or that the user holds the verified 'admin' role); Return HTTP 403 Forbidden or HTTP 404 Not Found whenever unauthorized access is attempted.`
    },
    {
      sno: 3,
      vulnName: 'Stored Cross-Site Scripting (XSS) via Product Reviews',
      owaspCat: 'A03:2025 - Injection',
      difficulty: 'Medium',
      steps: `1. Authenticate as any registered customer and navigate to a product catalog page (e.g., "/product/jce_3d5f7b9a1c3e").
2. In Burp Suite, capture the POST /api/products/jce_3d5f7b9a1c3e/reviews submission request.
3. In the "comment" JSON parameter, inject a non-destructive XSS proof-of-concept payload such as: <script>console.log("XSS-PoC-Triggered")</script> or <img src=x onerror="console.log('XSS-Verified')">.
4. Forward the request to the server and confirm an HTTP 201 Created response.
5. In a secondary browser session or incognito window, browse to the target product details page.
6. Inspect the browser Developer Tools Console to confirm execution of the injected script tag when the review section renders.`,
      impacts: `Execution of arbitrary JavaScript within victim browser contexts; Potential session hijacking and credential theft via cookie/token access; Defacement of boutique product pages and forced client-side redirection to malicious domains.`,
      remediation: `Implement contextual HTML entity encoding and strict sanitization (e.g., using DOMPurify or sanitize-html) on all user-supplied review content prior to storage and rendering; Deploy a robust Content Security Policy (CSP) header restricting inline script execution.`
    },
    {
      sno: 4,
      vulnName: 'Mass Assignment / Privilege Escalation on Profile Update',
      owaspCat: 'A01:2025 - Broken Access Control',
      difficulty: 'Medium',
      steps: `1. Authenticate as a standard customer account ("role": "customer") and navigate to the Profile Settings page.
2. In Burp Suite Proxy, intercept the outgoing PUT /api/users/profile request sent when saving profile edits.
3. In the request JSON body, inject the administrative role assignment field: "role": "admin".
4. Forward the request to the backend and observe the HTTP 200 OK response.
5. Verify in the response body that "role" has updated to "admin".
6. Navigate to /admin or send a GET /api/admin/system-status request with the user session to confirm administrative privileges have been acquired.`,
      impacts: `Unauthorized elevation of standard user privileges to full store administrator; Unrestricted access to administrative configuration, inventory management, and sensitive customer records; Complete compromise of application access control boundaries.`,
      remediation: `Employ strict request payload filtering (allowlisting) on user profile update endpoints to only accept editable fields (e.g., name, phone, address); Explicitly reject or strip protected properties such as "role", "permissions", or "is_admin" from unprivileged profile update operations.`
    },
    {
      sno: 5,
      vulnName: 'Incomplete Server-Side Session Revocation on Logout',
      owaspCat: 'A07:2025 - Identification and Authentication Failures',
      difficulty: 'Easy',
      steps: `1. Authenticate as a customer and capture the active session token (e.g., Authorization: Bearer <token> or hjs_session cookie) in Burp Suite.
2. Send an authenticated request (e.g., GET /api/users/me) to Burp Repeater to verify valid session state (HTTP 200 OK).
3. In the web application interface, click "Log Out" to initiate the logout flow (POST /api/auth/logout).
4. In Burp Repeater, re-issue the previous GET /api/users/me request using the original pre-logout session token.
5. Verify that the server responds with HTTP 200 OK and returns user account data instead of returning HTTP 401 Unauthorized.`,
      impacts: `Persistent token validity enabling replay attacks and session hijacking; Exposure of user accounts on shared, public, or compromised devices post-logout; Failure to invalidate active credentials upon explicit user sign-out request.`,
      remediation: `Maintain a centralized server-side token revocation blocklist or database-backed active session table; Invalidate and delete the active session record upon invocation of the logout endpoint; Implement short-lived access tokens coupled with strictly invalidated refresh tokens.`
    },
    {
      sno: 6,
      vulnName: 'Prototype Pollution via Recursive Address Merging',
      owaspCat: 'A08:2025 - Software and Data Integrity Failures',
      difficulty: 'Hard',
      steps: `1. Authenticate as a registered user and send a PUT /api/users/profile/address request to Burp Repeater.
2. In the JSON request payload, inject a prototype property mutation payload, for example:
   {"address": {"street": "123 Main St", "__proto__": {"pollutedFlag": true, "isAdminBypass": true}}}.
3. Send the request and verify HTTP 200 OK response.
4. Send an unauthenticated or test request to an endpoint that reads object properties (e.g., GET /api/system/health or evaluate ({}).pollutedFlag in Node runtime).
5. Verify that Object.prototype has been polluted with the injected properties across the server runtime context.`,
      impacts: `Global modification of Object prototype properties impacting server logic; Potential remote code execution (RCE) or universal authorization bypass depending on downstream object lookups; Server instability or Denial of Service (DoS) through object mutation and unexpected exceptions.`,
      remediation: `Use Object.assign(), spread syntax ({...obj}), or a safe deep-merge utility that explicitly denies "__proto__", "constructor", and "prototype" property keys; Alternatively, freeze the prototype using Object.freeze(Object.prototype) during application initialization.`
    },
    {
      sno: 7,
      vulnName: 'Race Condition on Inventory Stock Check During Checkout',
      owaspCat: 'A04:2025 - Insecure Design',
      difficulty: 'Hard',
      steps: `1. Identify an item in the store catalog with a limited stock balance (e.g., stock = 1 for "jce_8f1a3d5e7c9b").
2. Prepare two separate checkout request payloads for POST /api/orders requesting quantity 1 of the item.
3. In Burp Suite Repeater, place both requests in a single tab group.
4. Configure Burp Repeater to send the group using "Send group in parallel (last-byte sync)".
5. Execute the concurrent request group.
6. Inspect the server responses to confirm that both requests return HTTP 201 Created and the inventory count decrements below zero into a negative stock value.`,
      impacts: `Overselling of limited inventory causing operational and fulfillment failures; Financial discrepancy between recorded inventory value and actual stock quantities; Inability to fulfill customer orders leading to reputational and revenue damage.`,
      remediation: `Implement atomic database updates (e.g., UPDATE products SET stock = stock - qty WHERE id = ? AND stock >= qty) or transactional locks/mutexes during stock validation and decrement routines; Reject checkout transactions if atomic decrement operations return zero affected rows.`
    },
    {
      sno: 8,
      vulnName: 'Horizontal Account Modification via Target User Parameter',
      owaspCat: 'A01:2025 - Broken Access Control',
      difficulty: 'Medium',
      steps: `1. Authenticate as Attacker Account ("usr_c3e5d7f1a9b4").
2. Intercept the profile update request (PUT /api/users/profile) in Burp Suite Proxy.
3. In the request body or query parameter, add a target user identifier: "targetUserId": "usr_7a2e9b4d1f8c" (Victim Account ID), modifying the shipping address or name.
4. Forward the request and observe the server response.
5. Authenticate as the Victim Account ("usr_7a2e9b4d1f8c") and verify that their profile details were modified without their consent.`,
      impacts: `Unauthorized modification of arbitrary customer account profiles and shipping addresses; Account takeover risk through modification of registered email/contact points; Breach of multi-tenant isolation and user data integrity.`,
      remediation: `Ensure that profile modification logic derives the subject user ID exclusively from the cryptographically verified session token; Disallow and ignore client-supplied target user parameters in non-administrative profile routes.`
    },
    {
      sno: 9,
      vulnName: 'Overly Permissive CORS Policy with Origin Reflection',
      owaspCat: 'A05:2025 - Security Misconfiguration',
      difficulty: 'Medium',
      steps: `1. In Burp Suite Repeater, create a request to an authenticated endpoint containing sensitive data (e.g., GET /api/users/me).
2. Inject a custom Origin header representing an untrusted third-party domain: "Origin: https://evil-attacker-boutique.com".
3. Send the request to the server.
4. Inspect the HTTP response headers.
5. Verify that the server reflects the arbitrary origin in "Access-Control-Allow-Origin: https://evil-attacker-boutique.com" and sets "Access-Control-Allow-Credentials: true".
6. Confirm that an attacker webpage can execute cross-origin authenticated read requests against the victim's session.`,
      impacts: `Cross-origin exfiltration of sensitive authenticated user data and order history; Unauthorized extraction of customer PII by third-party malicious websites; Subversion of Same-Origin Policy (SOP) protections.`,
      remediation: `Configure a strict CORS allowlist containing only trusted application domains; Avoid dynamically reflecting arbitrary Origin header values when "Access-Control-Allow-Credentials" is true; Disallow wildcard ("*") origins in authenticated contexts.`
    },
    {
      sno: 10,
      vulnName: 'Integer Truncation / 32-Bit Bitwise Wrap on Order Totals',
      owaspCat: 'A04:2025 - Insecure Design',
      difficulty: 'Hard',
      steps: `1. Add an item to the shopping cart and proceed to the checkout endpoint.
2. In Burp Suite Proxy, intercept the POST /api/orders request.
3. In the request body, supply a large integer quantity designed to cause an arithmetic or 32-bit bitwise overflow/wrap (e.g., quantity: 4294967297 or quantity: 2147483648).
4. Forward the request to the server.
5. Inspect the server calculation in the response.
6. Verify that the total amount wraps or truncates into an unexpectedly small positive integer or zero amount, allowing mass order processing at negligible cost.`,
      impacts: `Arbitrary billing manipulation leading to severe financial loss; Inventory exhaustion through unauthorized high-volume order submissions; Corruption of financial ledgers and backend transaction accounting.`,
      remediation: `Implement strict input boundary validation enforcing realistic minimum and maximum quantity limits (e.g., 1 to 50 items per line); Use safe mathematical libraries or BigInt / floating-point decimal handlers that prevent 32-bit bitwise integer overflow behaviors.`
    }
  ];

  // Header row styling
  const headerRow = worksheet.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = {
      name: 'Segoe UI',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' } // Dark Slate Blue / Navy
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF334155' } }
    };
  });

  // Populate data rows
  data.forEach((item, index) => {
    const row = worksheet.addRow(item);
    const isEven = index % 2 === 1;

    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: 'Segoe UI',
        size: 10,
        color: { argb: 'FF1E293B' }
      };

      // Zebra striping
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFF8FAFC' : 'FFFFFFFF' }
      };

      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Alignment rules per column
      if (colNumber === 1) { // S.No
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF334155' } };
      } else if (colNumber === 4) { // Difficulty
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (item.difficulty === 'Easy') {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF166534' } }; // Green
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
        } else if (item.difficulty === 'Medium') {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF9A3412' } }; // Amber/Orange
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } };
        } else if (item.difficulty === 'Hard') {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF991B1B' } }; // Red
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        }
      } else if (colNumber === 2) { // Vuln Name
        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      } else if (colNumber === 3) { // OWASP
        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        cell.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FF475569' } };
      } else { // Steps, Impacts, Remediation
        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
      }
    });
  });

  const outputPath = path.resolve(__dirname, '..', '..', 'Honey_Juice_Shop_Security_Reference_Matrix.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Excel file successfully created at: ${outputPath}`);
}

generateMatrix().catch(console.error);
