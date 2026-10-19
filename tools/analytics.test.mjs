import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const code = readFileSync(new URL('../site-analytics.js', import.meta.url), 'utf8');
function setup(host = 'vibephysicsai.com', saved) {
  const head = [], body = [], storage = new Map(saved ? [['vibephysicsai-analytics-consent', saved]] : []);
  const element = () => ({dataset: {}, setAttribute() {}, focus() {}, querySelector: element, addEventListener(type, fn) { this[type] = fn; }});
  const context = { URL, Date, localStorage: {getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v)},
    location: {hostname: host, reload() { context.reloaded = true; }},
    document: { currentScript: {src: 'https://' + host + '/site-analytics.js'}, cookie: '',
      createElement: element, head: {append: e => head.push(e)}, body: {append: (...e) => body.push(...e)}},
    addEventListener() {} };
  context.window = context;
  vm.runInNewContext(code, context);
  return {context, head, body, storage, choose(value) {body[1].click({target: {dataset: {choice: value}}});}};
}
test('Analytics is blocked before consent and after decline', () => {
  const run = setup();
  assert.equal(run.head.filter(e => e.src).length, 0);
  run.choose('declined');
  assert.equal(run.head.filter(e => e.src).length, 0);
  assert.equal(run.body[1].hidden, true);
});
test('Acceptance loads exactly one tag; withdrawal disables and reloads', () => {
  const run = setup();
  run.choose('accepted'); run.choose('accepted');
  assert.equal(run.head.filter(e => e.src).length, 1);
  assert.match(run.head.find(e => e.src).src, /G-081CN8GZGQ$/);
  assert.equal(run.context.dataLayer.filter(e => e[0] === 'config').length, 1);
  run.choose('declined');
  assert.equal(run.context['ga-disable-G-081CN8GZGQ'], true);
  assert.equal(run.context.reloaded, true);
});
test('Saved consent persists and localhost never loads Google', () => {
  assert.equal(setup('vibephysicsai.com', 'accepted').head.filter(e => e.src).length, 1);
  assert.equal(setup('vibephysicsai.com', 'declined').head.filter(e => e.src).length, 0);
  const local = setup('localhost');
  local.choose('accepted');
  assert.equal(local.head.filter(e => e.src).length, 0);
});
