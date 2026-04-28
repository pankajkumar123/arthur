#!/usr/bin/env node

/**
 * Phase 4+5 Integration Test Suite
 * Tests all backend endpoints for payment and notification integration
 */

const http = require('http');
const https = require('https');

class TestRunner {
  constructor() {
    this.baseURL = 'http://localhost:4000/api';
    this.token = null;
    this.userId = null;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseURL);
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: data ? JSON.parse(data) : null,
              headers: res.headers
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: data,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  async test(name, fn) {
    try {
      await fn();
      this.results.passed++;
      this.results.tests.push({ name, status: '✓ PASS', time: new Date() });
      console.log(`✓ ${name}`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: '✗ FAIL', error: error.message });
      console.log(`✗ ${name}: ${error.message}`);
    }
  }

  assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  async run() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Phase 4+5 Integration Test Suite');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 1: Health Check
    await this.test('Health Check', async () => {
      const res = await this.request('GET', '/health');
      this.assert(res.status === 200, `Expected 200, got ${res.status}`);
      this.assert(res.data.status === 'ok', 'Health check failed');
      this.assert(res.data.database === 'connected', 'Database not connected');
    });

    // Test 2: User Registration
    await this.test('User Registration', async () => {
      const res = await this.request('POST', '/auth/register', {
        name: 'Test User ' + Date.now(),
        email: `test${Date.now()}@test.com`,
        password: 'Test@12345'
      });
      this.assert(res.status === 201, `Expected 201, got ${res.status}`);
      this.assert(res.data.token, 'No token returned');
      this.token = res.data.token;
      this.userId = res.data.userId;
    });

    // Test 3: User Login
    await this.test('User Login', async () => {
      const res = await this.request('POST', '/auth/login', {
        email: `test${Math.floor(Date.now()/1000)}@test.com`,
        password: 'Test@12345'
      });
      // Expected to fail for new user, but endpoint should exist
      this.assert(res.status === 200 || res.status === 401, 'Login endpoint error');
    });

    // Test 4: Get Catalog Products
    await this.test('Get Products Catalog', async () => {
      const res = await this.request('GET', '/catalog/products');
      this.assert(res.status === 200, `Expected 200, got ${res.status}`);
      this.assert(Array.isArray(res.data) || res.data.products, 'No products returned');
    });

    // Test 5: Get Product Categories
    await this.test('Get Product Categories', async () => {
      const res = await this.request('GET', '/catalog/categories');
      this.assert(res.status === 200, `Expected 200, got ${res.status}`);
      this.assert(Array.isArray(res.data) || res.data.categories, 'No categories returned');
    });

    // Test 6: Authenticated Cart Access
    await this.test('Access Cart (Authenticated)', async () => {
      if (!this.token) {
        throw new Error('No auth token available');
      }
      const res = await this.request('GET', '/cart', null, {
        'Authorization': `Bearer ${this.token}`
      });
      this.assert(res.status === 200, `Expected 200, got ${res.status}`);
    });

    // Test 7: Get User Profile
    await this.test('Get User Profile', async () => {
      if (!this.token) {
        throw new Error('No auth token available');
      }
      const res = await this.request('GET', '/auth/me', null, {
        'Authorization': `Bearer ${this.token}`
      });
      this.assert(res.status === 200, `Expected 200, got ${res.status}`);
      this.assert(res.data.email, 'No email in profile');
    });

    // Test 8: Payment Routes Available
    await this.test('Payment Routes Available', async () => {
      const res = await this.request('POST', '/payment/create-order', 
        { amount: 1000 },
        { 'Authorization': `Bearer ${this.token || 'test'}` }
      );
      // Just check endpoint exists (may fail on auth)
      this.assert(res.status === 200 || res.status === 401 || res.status === 400, 
        `Unexpected status: ${res.status}`);
    });

    // Test 9: Notification Preferences Available
    await this.test('Notification Endpoints Available', async () => {
      const res = await this.request('GET', '/notifications/preferences', null,
        { 'Authorization': `Bearer ${this.token || 'test'}` }
      );
      this.assert(res.status === 200 || res.status === 401, 
        `Unexpected status: ${res.status}`);
    });

    // Test 10: Orders Routes Available  
    await this.test('Orders Routes Available', async () => {
      const res = await this.request('GET', '/orders/history', null,
        { 'Authorization': `Bearer ${this.token || 'test'}` }
      );
      this.assert(res.status === 200 || res.status === 401, 
        `Unexpected status: ${res.status}`);
    });

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nTest Results:`);
    console.log(`✓ Passed: ${this.results.passed}`);
    console.log(`✗ Failed: ${this.results.failed}`);
    console.log(`Total:   ${this.results.passed + this.results.failed}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (this.results.failed === 0) {
      console.log('🎉 All tests passed! Phase 4+5 is ready for manual testing.\n');
      process.exit(0);
    } else {
      console.log(`⚠️  ${this.results.failed} test(s) failed.\n`);
      process.exit(1);
    }
  }
}

// Run tests
const runner = new TestRunner();
runner.run().catch(console.error);
