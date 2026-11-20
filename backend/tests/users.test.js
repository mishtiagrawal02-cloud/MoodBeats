import { describe, it, before } from 'node:test';
import assert from 'node:assert';

const API_URL = process.env.TEST_API_URL || 'http://localhost:3001';

describe('User Tests', () => {
  let testToken = null;
  let userId = null;
  const testUsername = `usertest_${Date.now()}`;

  before(async () => {
    // Create test user
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: testUsername }),
    });

    const data = await response.json();
    testToken = data.data.token;
    userId = data.data.user.userId;
  });

  it('should get current user profile', async () => {
    const response = await fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.userId);
    assert.strictEqual(data.data.userName, testUsername);
    assert.strictEqual(typeof data.data.totalSessions, 'number');
    assert.strictEqual(typeof data.data.totalMinutes, 'number');
  });

  it('should update user profile', async () => {
    const newUsername = `updated_${testUsername}`;

    const response = await fetch(`${API_URL}/api/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({ userName: newUsername }),
    });

    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.userName, newUsername);
  });

  it('should get user by ID', async () => {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.userId, userId);
  });

  it('should return 404 for non-existent user', async () => {
    const response = await fetch(`${API_URL}/api/users/999999`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    const data = await response.json();

    assert.strictEqual(response.status, 404);
    assert.strictEqual(data.success, false);
  });
});
