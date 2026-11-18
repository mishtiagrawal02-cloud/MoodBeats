import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function validateCustomDuration(val) {
  if (val === undefined || val === null || String(val).trim() === '') {
    return 'Please enter a duration in minutes (1–180).';
  }
  const str = String(val).trim();
  const num = Number(str);
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    return 'Please enter a whole number of minutes (no decimals).';
  }
  if (num < 1) {
    return 'Duration must be at least 1 minute.';
  }
  if (num > 180) {
    return 'Duration cannot exceed 180 minutes (3 hours).';
  }
  return null;
}

function parseDurationInHook(customDuration, defaultDuration = 25) {
  if (customDuration) {
    const parsed = parseInt(customDuration, 10);
    return Number.isFinite(parsed) ? Math.max(1, Math.min(180, parsed)) : 25;
  }
  return defaultDuration;
}

describe('Custom Duration Validation', () => {
  it('accepts valid integers between 1 and 180', () => {
    assert.equal(validateCustomDuration('1'), null);
    assert.equal(validateCustomDuration('25'), null);
    assert.equal(validateCustomDuration('45'), null);
    assert.equal(validateCustomDuration('90'), null);
    assert.equal(validateCustomDuration('180'), null);
  });

  it('rejects values below 1 minute', () => {
    assert.match(validateCustomDuration('0'), /at least 1 minute/i);
    assert.match(validateCustomDuration('-10'), /at least 1 minute/i);
  });

  it('rejects values exceeding 180 minutes', () => {
    assert.match(validateCustomDuration('181'), /cannot exceed 180 minutes/i);
    assert.match(validateCustomDuration('240'), /cannot exceed 180 minutes/i);
    assert.match(validateCustomDuration('500'), /cannot exceed 180 minutes/i);
  });

  it('rejects non-integer / decimal values', () => {
    assert.match(validateCustomDuration('25.5'), /whole number of minutes/i);
    assert.match(validateCustomDuration('0.5'), /whole number of minutes/i);
    assert.match(validateCustomDuration('15.01'), /whole number of minutes/i);
  });

  it('rejects empty, null, undefined, or non-numeric strings', () => {
    assert.match(validateCustomDuration(''), /enter a duration/i);
    assert.match(validateCustomDuration('   '), /enter a duration/i);
    assert.match(validateCustomDuration(null), /enter a duration/i);
    assert.match(validateCustomDuration(undefined), /enter a duration/i);
    assert.match(validateCustomDuration('abc'), /whole number of minutes/i);
  });

  it('hook duration parsing clamps values safely between 1 and 180', () => {
    assert.equal(parseDurationInHook('0'), 1);
    assert.equal(parseDurationInHook('-15'), 1);
    assert.equal(parseDurationInHook('240'), 180);
    assert.equal(parseDurationInHook('500'), 180);
    assert.equal(parseDurationInHook('45'), 45);
    assert.equal(parseDurationInHook('invalid'), 25);
    assert.equal(parseDurationInHook(null, 30), 30);
  });
});
