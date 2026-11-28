import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';

describe('Portrait Semantic Partition of Unity', () => {
  it('passes all partition checks: 0 uncovered pixels, 0 excess weights, 0 silhouette spill, and clean component counts', () => {
    const scriptPath = path.resolve(process.cwd(), 'scripts/validate_portrait_partition.py');
    const result = execSync(`python3 "${scriptPath}"`, { encoding: 'utf-8' });
    assert.match(result, /ALL PORTRAIT PARTITION VALIDATION CHECKS PASSED/);
    assert.match(result, /\[Check 1\] Uncovered opaque pixels: 0/);
    assert.match(result, /\[Check 2\] Over-saturated pixels \(sum > 1.01 \* alpha\): 0/);
    assert.match(result, /\[Check 3\] Total pixels outside silhouette: 0/);
    assert.match(result, /\[Check 5\] Hitmap unassigned opaque pixels: 0/);
  });
});
