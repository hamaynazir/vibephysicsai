import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const code = readFileSync(new URL('../site-analytics.js', import.meta.url), 'utf8');
function setup(host = 'vibephysicsai.com') {
  const scripts = [];
  const context = {Date, location: {hostname: host},
    document: {createElement: () => ({}), head: {append: element => scripts.push(element)}}};
  context.window = context;
  vm.createContext(context);
  vm.runInContext(code, context);
  return {context, scripts};
}
test('Published site loads Analytics directly without interface or storage', () => {
  const {context, scripts} = setup();
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-081CN8GZGQ');
  assert.equal(scripts[0].async, true);
  assert.equal(context.dataLayer[1][0], 'config');
  assert.equal(context.dataLayer[1][1], 'G-081CN8GZGQ');
  assert.equal(context.dataLayer[1][2].allow_google_signals, false);
  vm.runInContext(code, context);
  assert.equal(scripts.length, 1);
});
test('www is tracked; local previews are not', () => {
  assert.equal(setup('www.vibephysicsai.com').scripts.length, 1);
  assert.equal(setup('localhost').scripts.length, 0);
  assert.equal(setup('127.0.0.1').scripts.length, 0);
});
