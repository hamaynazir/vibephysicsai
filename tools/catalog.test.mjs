import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {subjects,laboratories,collections,allLessons,lessonPosition,lessonURL,searchSubjects} from '../catalog.js';
test('Explore More separates four credited resources from News and uses actual brand assets',()=>{const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),js=fs.readFileSync(new URL('../library.js',import.meta.url),'utf8');assert.equal((html.match(/class="news-resource resource-row"/g)||[]).length,4);const news=html.slice(html.indexOf('<section id="news-view"'),html.indexOf('<section id="explore-view"'));assert.ok(!news.includes('resource-row'));assert.match(html,/datetime="2026-10-01"/);assert.match(html,/datetime="2002"/);assert.match(html,/datetime="2001"/);assert.match(html,/Collection creation date: <strong>not confirmed/);assert.match(html,/not a verified original project release date/);assert.match(html,/mishig\/feynman-interactive/);assert.ok(!js.includes('external-resource'));assert.ok(!collections.some(c=>/feynman/i.test(c.id)));assert.ok(!html.includes('class="resource-monogram"'));for(const asset of ['phet-logo.png','myphysicslab-logo.png','falstad-icon.ico'])assert.ok(fs.statSync(new URL('../assets/'+asset,import.meta.url)).size>100);assert.match(html,/id="explore-nav"/);});
test('Homepage omits resume card while retaining the separate header resume link',()=>{const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),js=fs.readFileSync(new URL('../library.js',import.meta.url),'utf8');assert.ok(!html.includes('id="continue-card"'));assert.ok(!js.includes("$('#continue-card')"));assert.match(html,/id="header-resume"/);assert.match(html,/welcome-simple/);});
test('Main headers include News and library brand explicitly restores home',()=>{
 const home=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),about=fs.readFileSync(new URL('../about.html',import.meta.url),'utf8'),js=fs.readFileSync(new URL('../library.js',import.meta.url),'utf8');
 assert.match(home,/id="news-nav"/);assert.match(home,/id="news-view"/);assert.match(about,/href="\.\/#news"/);assert.match(js,/library-brand.*addEventListener\('click'/);assert.match(js,/popstate/);
});
test('UOS Physics groups existing subjects and laboratories into Fourth Year without moving reader URLs',()=>{
 assert.equal(collections[0].title,'UOS Physics');const year=collections[0].years[0];assert.equal(year.title,'Fourth Year');assert.deepEqual(year.subjectIds,subjects.map(s=>s.id));assert.deepEqual(year.laboratoryIds,laboratories.map(l=>l.id));
 const home=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(home,/id="collection-cards"/);assert.match(home,/id="collection-view"/);assert.match(home,/id="fourth-year"/);assert.match(home,/assets\/uos-logo\.png/);
 const about=fs.readFileSync(new URL('../about.html',import.meta.url),'utf8');assert.match(about,/href="https:\/\/github.com\/hamaynazir"/);assert.match(about,/GITHUB PROFILE/);
});

test('Laboratories are distinct from lecture subjects with six prepared experiments each',()=>{
 assert.deepEqual(laboratories.map(l=>l.title),['Nuclear Laboratory','Solid State Physics Lab']);
 assert.equal(new Set(laboratories.map(l=>l.id)).size,2);
 for(const lab of laboratories){assert.equal(lab.experiments.length,6);assert.ok(!subjects.some(s=>s.id===lab.id));assert.ok(fs.existsSync(new URL('../'+lab.reader,import.meta.url)));}
 assert.equal(allLessons().length,5);
});
import {resumeReaderURL,preferredChapter} from '../reader-navigation.js';
test('Reader switching uses chapter-specific saved pages and supports future chapter choices',()=>{const storage={getItem:key=>key==='crystal-page'?'6':key.includes('laser-radiation:page')?'8':null};const lessons=allLessons();assert.equal(resumeReaderURL(lessons.find(l=>l.id==='crystal-structures'),storage,'https://example.org/'),'https://example.org/reader.html#page=6');assert.match(resumeReaderURL(lessons.find(l=>l.id==='laser-radiation'),storage,'https://example.org/'),/laser-radiation\/index.html#page=8$/);assert.match(resumeReaderURL(lessons.find(l=>l.id==='materials-and-bonding'),storage,'https://example.org/'),/#page=1$/);const future={lessons:[{id:'one'},{id:'two'}]};assert.equal(preferredChapter(future,'two').id,'two');assert.equal(preferredChapter(future,'missing').id,'one');assert.equal(preferredChapter({lessons:[]},null),null);});
test('Reader labels distinguish subject labs, chapters and section navigation',()=>{const root=fs.readFileSync(new URL('../reader.html',import.meta.url),'utf8');assert.match(root,/Solid State <span>Lab<\/span>/);assert.match(root,/Solid State Principles · Chapter 1: Crystal Structures/);assert.match(root,/>Sections<\/button>/);assert.ok(!root.includes('CRYSTAL LAB'));for(const [path,context]of [['lessons/materials-science/materials-and-bonding/index.html','Materials Science · Chapter 1: Materials and Bonding'],['lessons/laser-physics/laser-radiation/index.html','Laser Physics · Chapter 1: Laser Radiation and Its Properties']]){const html=fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');assert.ok(html.includes(context));assert.match(html,/>Sections<\/button>/);}const about=fs.readFileSync(new URL('../about.html',import.meta.url),'utf8');assert.match(about,/not a live AI tutor/);});
test('all five requested subjects exist and listed chapters have real readers',()=>{
 assert.deepEqual(subjects.map(s=>s.title),['Materials Science','Laser Physics','Solid State Principles','Nuclear Models','Electromagnetic Theory']);
 assert.ok(subjects.every(s=>s.lecturer), 'Every subject identifies its lecturer');
 const lessons=allLessons(),crystal=lessons.find(l=>l.id==='crystal-structures');assert.ok(crystal);assert.equal(crystal.subjectId,'solid-state-principles');assert.equal(crystal.title,'Crystal Structures');for(const lesson of lessons)assert.ok(fs.existsSync(new URL('../'+lesson.reader,import.meta.url)),`Missing reader for ${lesson.id}`);assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length);
 assert.equal(crystal.lecturer,'Mr. Shaho Mohammed Rasul');
 assert.equal(new Set(subjects.map(s=>s.id)).size,subjects.length);
});
test('resume positions handle missing, corrupt and out-of-range browser values',()=>{
 const lesson=allLessons().find(l=>l.id==='crystal-structures');assert.equal(lessonPosition(lesson,{getItem:()=>null}),null);assert.equal(lessonPosition(lesson,{getItem:()=>'-1'}),null);assert.equal(lessonPosition(lesson,{getItem:()=>'wrong'}),null);assert.equal(lessonPosition(lesson,{getItem:()=>'999'}),40);assert.equal(lessonPosition(lesson,{getItem:()=>'7'}),7);assert.equal(lessonPosition(lesson,{getItem:()=>{throw Error('Blocked')}}),null);
 assert.equal(lessonURL(lesson,7),'reader.html#page=7');assert.equal(lessonURL(lesson,-4),'reader.html#page=1');
});
test('search finds subjects and chapter contents; ready filter excludes future subjects',()=>{
 assert.ok(searchSubjects('Crystal').some(s=>s.id==='solid-state-principles'));assert.equal(searchSubjects('laser').length,1);assert.equal(searchSubjects('',true).length,subjects.filter(s=>s.lessons.length>0).length);assert.ok(searchSubjects('laser',true).every(s=>s.lessons.length>0));assert.equal(searchSubjects('missing subject').length,0);
});
test('each available lesson declares unique reading and learning keys',()=>{
 const lessons=allLessons();assert.equal(new Set(lessons.map(l=>l.storage.page)).size,lessons.length);assert.equal(new Set(lessons.map(l=>l.storage.learning)).size,lessons.length);
 const crystal=lessons.find(l=>l.id==='crystal-structures');assert.equal(crystal.storage.page,'crystal-page');assert.equal(crystal.storage.learning,'crystal-learning-v1');
});
