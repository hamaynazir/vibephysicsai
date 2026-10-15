import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {subjects,allLessons,lessonPosition,lessonURL,searchSubjects} from '../catalog.js';
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
