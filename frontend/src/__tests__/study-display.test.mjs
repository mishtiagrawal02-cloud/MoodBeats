import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { formatPointDelta, formatDurationLabel } from '../utils/studyFormatting.js';

/**
 * Regression tests for the pre-save stress impact indicator
 * (AfterStudyCheckIn) and the receipt card (SessionCompleteCard).
 * Convention: stressDelta = pre.stress - post.stress, so a REDUCTION is positive.
 * Both components must produce identical strings for the same delta.
 */
describe('Stress relief point delta formatting', () => {
  const sessionCardRule = (stressDelta) => stressDelta > 0 ? `+${stressDelta} pts` : stressDelta === 0 ? '0 pts' : `${stressDelta} pts`;

  it('shows reduced stress as positive (3 -> 2 is +1 pts)', () => {
    const stressDelta = 3 - 2;
    assert.equal(formatPointDelta(stressDelta), '+1 pts');
  });

  it('shows larger reductions as positive (4 -> 1 is +3 pts)', () => {
    const stressDelta = 4 - 1;
    assert.equal(formatPointDelta(stressDelta), '+3 pts');
  });

  it('shows increased stress as negative (2 -> 3 is -1 pts)', () => {
    const stressDelta = 2 - 3;
    assert.equal(formatPointDelta(stressDelta), '-1 pts');
  });

  it('shows no change as 0 pts', () => {
    assert.equal(formatPointDelta(0), '0 pts');
  });

  it('agrees with the SessionCompleteCard delta rule for every delta', () => {
    for (let delta = -9; delta <= 9; delta += 1) {
      assert.equal(formatPointDelta(delta), sessionCardRule(delta));
    }
  });
});

describe('Duration label pluralization', () => {
  it('uses the singular for one minute', () => {
    assert.equal(formatDurationLabel(1), '1 minute');
  });

  it('uses the plural for 2 and 25 minutes', () => {
    assert.equal(formatDurationLabel(2), '2 minutes');
    assert.equal(formatDurationLabel(25), '25 minutes');
  });

  it('uses the plural for zero minutes', () => {
    assert.equal(formatDurationLabel(0), '0 minutes');
  });
});
