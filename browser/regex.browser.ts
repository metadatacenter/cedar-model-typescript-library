import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type * as Policy from '../src/policy';
const corpus = JSON.parse(readFileSync(resolve('itest/resources/concordance/regex-policy.json'), 'utf8'));
const bundle = resolve('dist/policy.umd.js');
test('matches the Java corpus and leaves the page responsive during catastrophic backtracking', async ({ page }) => {
  await page.addScriptTag({ path: bundle });
  const results = await page.evaluate(async (rows) => {
    const { RegexPolicy } = (globalThis as unknown as { CedarValidationPolicy: typeof Policy }).CedarValidationPolicy;
    const policy = new RegexPolicy();
    try {
      const actual = [];
      for (const row of rows) actual.push(await policy.evaluate(row.pattern, row.value));
      let ticks = 0;
      const timer = setInterval(() => ticks++, 10);
      const slow = await policy.evaluate('(a+)+', 'a'.repeat(40) + '!');
      clearInterval(timer);
      const recovered = await policy.evaluate('a+', 'aaa');
      return { actual, slow, recovered, ticks };
    } finally {
      policy.dispose();
    }
  }, corpus.cases);
  expect(results.actual).toEqual(corpus.cases.map((row: { expected: string }) => row.expected));
  expect(results.slow).toBe('timeout');
  expect(results.recovered).toBe('match');
  expect(results.ticks).toBeGreaterThan(3);
});
test('CSP cannot cause an unbounded synchronous fallback', async ({ page }) => {
  await page.setContent('<meta http-equiv="Content-Security-Policy" content="worker-src \'none\'">');
  await page.addScriptTag({ path: bundle });
  const verdict = await page.evaluate(async () => {
    const { RegexPolicy } = (globalThis as unknown as { CedarValidationPolicy: typeof Policy }).CedarValidationPolicy;
    const policy = new RegexPolicy({ startupTimeoutMs: 100 });
    try {
      return await policy.evaluate('(a+)+', 'a'.repeat(40) + '!');
    } finally {
      policy.dispose();
    }
  });
  expect(verdict).toBe('unavailable');
});
