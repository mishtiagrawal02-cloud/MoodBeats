import { describe, it, after } from 'node:test';
import assert from 'node:assert';

const API_URL = process.env.TEST_API_URL || 'http://localhost:3001';

describe('Authentication Tests', () => {
  let testToken = null;
  const testUsername = `testuser_${Date.now()}`;

  after(async () => {
    // Cleanup: We don't have a delete user endpoint, so just note for manual cleanup if needed
    console.log(`Test user created: ${testUsername}`);
  });

  it('should register a new user', async () => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: testUsername }),
    });

    const data = await response.json();

    assert.strictEqual(response.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.token);
    assert.ok(data.data.user);
    assert.strictEqual(data.data.user.userName, testUsername);

    testToken = data.data.token;
  });

  it('should reject duplicate registration', async () => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: testUsername }),
    });

    const data = await response.json();

    assert.strictEqual(response.status, 409);
    assert.strictEqual(data.success, false);
  });

  it('should login existing user', async () => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: testUsername }),
    });

    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.token);
    assert.ok(data.data.user);
  });

  it('should reject missing username', async () => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    assert.strictEqual(response.status, 422);
    assert.strictEqual(data.success, false);
  });

  it('should reject request without auth token', async () => {
    const response = await fetch(`${API_URL}/api/users/me`);
    const data = await response.json();

    assert.strictEqual(response.status, 401);
    assert.strictEqual(data.success, false);
  });

  it('should reject request with invalid token', async () => {
    const response = await fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: 'Bearer invalid_token' },
    });

    const data = await response.json();

    assert.strictEqual(response.status, 401);
    assert.strictEqual(data.success, false);
  });
});
