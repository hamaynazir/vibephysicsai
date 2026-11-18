import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {allLessons,laboratories} from '../catalog.js';

test('all seven readers include a complete web preview for every page',()=>{
  for(const book of [...allLessons(),...laboratories]){
    const reader=new URL('../'+book.reader,import.meta.url);
    const location=new URL('assets/reading/',reader);
    const pages=JSON.parse(readFileSync(new URL('pages.json',location),'utf8'));
    assert.equal(pages.length,book.pages,book.id);
    pages.forEach(({width,height},i)=>{
      assert.ok(width>0 && height>0);
      const image=readFileSync(new URL((i+1)+'.webp',location));
      assert.equal(image.toString('ascii',8,12),'WEBP');
    });
  }
});
