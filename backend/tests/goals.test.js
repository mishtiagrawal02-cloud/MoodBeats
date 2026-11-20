import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';

const API_URL = process.env.TEST_API_URL || 'http://localhost:3001';

describe('Goals Tests', () => {
  let testToken = null;
  const testUsername = `goaltest_${Date.now()}`;

  before(async () => {
    // Create test user
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: testUsername }),
    });

    const data = await response.json();
    testToken = data.data.token;
  });

  after(async () => {
    // Cleanup: delete goal
    await fetch(`${API_URL}/api/goals`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${testToken}` },
    });
  });

  it('should return 404 when no goal is set', async () => {
    const response = await fetch(`${API_URL}/api/goals`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    const data = await response.json();

    assert.strictEqual(response.status, 404);
    assert.strictEqual(data.success, false);
  });

  it('should create a weekly goal', async () => {
    const response = await fetch(`${API_URL}/api/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({ weeklyGoalMinutes: 300 }),
    });

    const data = await response.json();

    assert.strictEqual(response.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.weeklyGoalMinutes, 300);
  });

  it('should get existing goal', async () => {
    const response = await fetch(`${API_URL}/api/goals`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.weeklyGoalMinutes, 300);
  });

  it('should update existing goal', async () => {
    const response = await fetch(`${API_URL}/api/goals`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({ weeklyGoalMinutes: 450 }),
    });

    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.weeklyGoalMinutes, 450);
  });

  it('should get goal progress', async () => {
    const response = await fetch(`${API_URL}/api/goals/progress`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.weeklyGoalMinutes);
    assert.strictEqual(typeof data.data.minutesThisWeek, 'number');
    assert.strictEqual(typeof data.data.percentageComplete, 'number');
    assert.strictEqual(typeof data.data.isComplete, 'boolean');
  });

  it('should delete goal', async () => {
    const response = await fetch(`${API_URL}/api/goals`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${testToken}` },
    });

    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
  });

  it('should reject invalid goal data', async () => {
    const response = await fetch(`${API_URL}/api/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({ weeklyGoalMinutes: -10 }),
    });

    const data = await response.json();

    assert.strictEqual(response.status, 422);
    assert.strictEqual(data.success, false);
  });
});
