import { describe, it, before } from 'node:test';
import assert from 'node:assert';

const API_URL = process.env.TEST_API_URL || 'http://localhost:3001';

describe('Health Endpoint Tests', () => {
  it('should return API health status', async () => {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();

    assert.strictEqual(typeof data.success, 'boolean');
    assert.strictEqual(typeof data.message, 'string');
    assert.strictEqual(typeof data.timestamp, 'string');
    assert.strictEqual(typeof data.environment, 'string');
    assert.strictEqual(typeof data.database, 'object');
  });

  it('should include database status', async () => {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();

    assert.ok(data.database);
    assert.strictEqual(typeof data.database.connected, 'boolean');
  });
});
