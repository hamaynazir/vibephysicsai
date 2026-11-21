import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {sections, challenges} from '../lessons/nuclear-models/basic-concepts/content.js';

const {chromium} = await import(process.env.PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE) : 'playwright');
const browser = await chromium.launch({channel: process.env.BROWSER_CHANNEL || 'chrome'});
const base = process.env.CHECK_BASE || 'http://localhost:4173/';
const lecture = base + 'lessons/nuclear-models/basic-concepts/index.html';
const errors = [];
const desktop = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
desktop.on('pageerror', error => errors.push(error.message));
desktop.setDefaultTimeout(8000);
const section = desktop.locator('#visual-section');
const canvas = desktop.locator('#scene');
const timeline = desktop.locator('#nuclear-timeline');
const time = desktop.locator('#nuclear-time');
const play = desktop.locator('[data-motion=play]');
const step = desktop.locator('[data-motion=step]');
const reset = desktop.locator('[data-motion=reset]');
const pixels = () => canvas.evaluate(node=>node.toDataURL());
const metric = label => desktop.locator('.metric').filter({hasText:label}).locator('strong').innerText();

try {
  await desktop.goto(lecture+'#page=4&topic=binding');
  await desktop.waitForFunction(()=>document.querySelector('#scene')?.dataset.model==='binding');
  assert.equal(await desktop.locator('#page-input').inputValue(),'4');
  assert.equal(await desktop.locator('#reader-subject').inputValue(),'nuclear-models');
  assert.equal(await desktop.locator('#reader-chapter').inputValue(),'nuclear-basic-concepts');
  const previews = await desktop.locator('.reading-page img').evaluateAll(async images => {
    const result = await Promise.all(images.map(img => fetch(img.src || img.dataset.src)));
    return result.map(response=>response.ok);
  });
  assert.deepEqual(previews,Array(9).fill(true));

  for(const {id,page,controls} of sections) {
    await section.selectOption(id);
    assert.equal(await canvas.getAttribute('data-model'),id);
    assert.equal(await desktop.locator('#page-input').inputValue(),String(page));
    assert.equal(await canvas.getAttribute('aria-describedby'),'scene-caption');
    assert.doesNotMatch(await desktop.locator('#metrics').innerText(),/NaN|undefined|Infinity/);
    assert.equal(await timeline.isVisible(),['beta','scattering','recoil','fermi'].includes(id));
    assert.equal(await play.isVisible(),['binding','isomers','beta','scattering','recoil','fermi'].includes(id));
    for(const {key,options} of controls) {
      const input=desktop.locator('#control-'+key);
      if(options) await input.selectOption(options.at(-1)[0]);
      else await input.evaluate(el=>{el.value=el.max;el.dispatchEvent(new Event('input',{bubbles:true}));});
      assert.doesNotMatch(await desktop.locator('#metrics').innerText(),/NaN|undefined|Infinity/);
    }
    if(!['relations','particles'].includes(id)) assert.ok(await desktop.locator('#formula math').count()>0,id);
  }

  await section.selectOption('binding');
  await desktop.getByRole('combobox',{name:'Nuclide',exact:true}).selectOption('he-4');
  assert.match(await metric('Binding energy ≈'),/^28\.29/);
  await reset.click();
  assert.match(await time.innerText(),/Step 1 of 3/);
  const separated = await pixels();
  await step.click();
  assert.match(await time.innerText(),/Step 2 of 3/);
  assert.notEqual(await pixels(),separated);
  await step.press('Enter');
  assert.match(await time.innerText(),/Step 3 of 3/);
  await desktop.getByRole('combobox',{name:'Nuclide',exact:true}).selectOption('ni-62');
  assert.match(await metric('B/A'),/^8\.794/);

  await section.selectOption('isomers');
  await reset.click();
  const ground = await pixels();
  await step.click();
  assert.notEqual(await pixels(),ground);

  await section.selectOption('beta');
  assert.equal(await play.innerText(),'Play');
  const seek = value => timeline.evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},value);
  await seek(878.4*Math.log(2));
  assert.equal(await metric('Expected free-neutron survival'),'50.0%');
  const sample = await metric('Sample remaining');
  const half = await pixels();
  await timeline.press('End');
  assert.notEqual(await metric('Sample remaining'),sample);
  await seek(878.4*Math.log(2));
  assert.equal(await pixels(),half);
  await reset.click();
  assert.equal(await metric('Sample remaining'),'48 / 48');
  assert.equal(await timeline.inputValue(),'0');
  await timeline.press('ArrowRight');
  assert.equal(await timeline.inputValue(),'30');
  await desktop.getByRole('combobox',{name:'Simulation speed'}).selectOption('.25');
  await play.click();
  await desktop.waitForFunction(()=>Number(document.querySelector('#scene').dataset.time)>34);
  await play.click();
  assert.ok(Number(await timeline.inputValue())<100);
  await desktop.getByRole('combobox',{name:'Simulation speed'}).selectOption('4');
  await play.click();
  await desktop.waitForFunction(()=>Number(document.querySelector('#scene').dataset.time)>100);
  await play.click();
  const paused = await canvas.getAttribute('data-time');
  await desktop.waitForTimeout(180);
  assert.equal(await canvas.getAttribute('data-time'),paused);
  await play.click();
  await desktop.locator('#companion').evaluate(element=>{element.scrollTop=element.scrollHeight;});
  await desktop.waitForTimeout(100);
  const offscreen = await canvas.getAttribute('data-time');
  await desktop.waitForTimeout(200);
  assert.equal(await canvas.getAttribute('data-time'),offscreen);

  for(const id of ['scattering','recoil']) {
    await section.selectOption(id);
    await seek(.5);
    assert.equal(await metric('Relative kinetic energy'),'0');
    assert.equal(await metric('Relative separation'),await metric('Closest separation'));
    assert.match(await time.innerText(),/Turning point/);
    await timeline.press('ArrowRight');
    assert.match(await time.innerText(),/Separating/);
  }

  await section.selectOption('fermi');
  assert.equal(await play.innerText(),'Play');
  await reset.click();
  await step.click();
  assert.match(await time.innerText(),/At R/);
  assert.equal(await metric('Probe position'),await metric('Half-density radius'));
  await desktop.locator('#control-probe').fill('0');
  assert.equal(await metric('Probe position'),'0');
  await desktop.locator('#control-probe').press('End');
  assert.equal(await metric('Probe position'),'15');

  await desktop.locator('.lecture-tools > summary').click();
  await desktop.locator('.lecture-practice > summary').click();
  await desktop.locator('#learning-mode').selectOption('practice');
  for(const item of challenges){
    await desktop.locator('#exercise-select').selectOption(item.id);
    await desktop.locator('#numeric').fill(String(item.answer));
    await desktop.getByRole('button',{name:'Check answer',exact:true}).click();
    assert.match(await desktop.locator('#calculation-feedback').innerText(),/^Correct/);
  }
  await desktop.locator('#learning-mode').selectOption('notes');
  assert.ok(await desktop.locator('#activity math').count()>0);
  await desktop.locator('textarea').fill('Browser check: Fermi profile');
  await desktop.reload();
  await desktop.locator('.lecture-tools > summary').click();
  await desktop.locator('.lecture-practice > summary').click();
  await desktop.locator('#learning-mode').selectOption('notes');
  assert.equal(await desktop.locator('textarea').inputValue(),'Browser check: Fermi profile');
  await desktop.locator('#learning-mode').selectOption('guide');
  await desktop.locator('#guide-open').click();
  assert.equal(await section.inputValue(),'nuclides');
  await desktop.locator('#guide-next').click();
  assert.equal(await section.inputValue(),'relations');
  await desktop.locator('.lecture-tools > summary').click();
  await section.selectOption('fermi');
  await desktop.locator('#simulation-fullscreen').click();
  assert.equal(await desktop.locator('.simulation-focus').count(),1);
  await desktop.getByRole('button',{name:'Exit full-screen simulation'}).click();
  assert.equal(await desktop.locator('.simulation-focus').count(),0);

  const touch = await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2,reducedMotion:'reduce'});
  touch.on('pageerror',error=>errors.push(error.message));
  await touch.goto(lecture+'#page=5&topic=beta');
  await touch.getByRole('button',{name:'Step forward'}).tap();
  assert.equal(await touch.locator('#nuclear-timeline').inputValue(),'30');
  for(const width of [320,390,698]) {
    await touch.setViewportSize({width,height:844});
    assert.ok(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const bounds=await touch.locator('#nuclear-timeline').boundingBox();
    assert.ok(bounds.width>160&&bounds.x+bounds.width<=width);
  }
  await touch.getByRole('button',{name:'Lecture',exact:true}).tap();
  assert.ok(await touch.locator('.pdf-scroll').isVisible());
  await touch.getByRole('button',{name:'Simulation',exact:true}).tap();
  assert.ok(await touch.locator('#scene').isVisible());

  await desktop.emulateMedia({reducedMotion:'no-preference'});
  await desktop.bringToFront();
  await desktop.goto(lecture+'?check=density-autoplay#page=8&topic=fermi');
  await canvas.scrollIntoViewIfNeeded();
  await desktop.waitForFunction(()=>Number(document.querySelector('#scene').dataset.time)>.1);
  assert.equal(await play.innerText(),'Pause');
  await desktop.locator('#control-probe').fill('3');
  assert.equal(await play.innerText(),'Play');
  assert.equal(await metric('Probe position'),'3');

  await desktop.goto(base+'lessons/laser-physics/laser-radiation/index.html#page=2&topic=fields');
  await desktop.locator('#reader-subject').waitFor();
  assert.equal(await desktop.locator('#reader-subject').inputValue(),'laser-physics');
  assert.equal(await desktop.locator('#nuclear-timeline').count(),0);
  await desktop.locator('#reader-subject').selectOption('nuclear-models');
  await desktop.waitForURL('**/basic-concepts/index.html#page=8');
  assert.deepEqual(errors,[]);
  console.log('PASS: 9 page assets, 14 model sections, 11 exercises, MathML, timelines, reduced motion, touch, notes, guide, fullscreen and cross-lecture navigation.');
} finally {
  await browser.close();
}
