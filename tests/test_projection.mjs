import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {projectWorld} from '../apps/web/model.mjs';
const bundle=JSON.parse(readFileSync(new URL('../examples/miniature-world.json',import.meta.url)));
const layout=JSON.parse(readFileSync(new URL('../apps/web/layout.json',import.meta.url)));
test('complete synthetic world retains disconnected reports and contradictions',()=>{
 const world=projectWorld(bundle,layout,5);
 assert.equal(world.dreams.length,20);assert.equal(world.places.length,5);
 assert.equal(world.unconnected.length,3);
 assert.equal(world.edges.filter(e=>e.stance==='contradicts').length,4);
 assert.equal(new Set(world.places.map(p=>p.class)).size,4);
 for(const edge of world.edges){assert(world.dreams.some(d=>d.id===edge.source_event_id));assert(world.places.some(p=>p.id===edge.place_id));}
});
test('historical view does not leak later places, observations or annotations',()=>{
 const first=projectWorld(bundle,layout,1),fourth=projectWorld(bundle,layout,4),last=projectWorld(bundle,layout,5);
 assert.equal(first.places.length,3);assert.equal(first.annotations.length,0);
 assert.equal(fourth.annotations.length,0);assert.equal(last.annotations.length,3);
 assert.equal(last.edges.length,fourth.edges.length+1);
 assert(first.unconnected.some(d=>d.title==='Blue stairs'));
 assert(!first.edges.some(e=>first.unconnected.some(d=>d.id===e.source_event_id)));
});
test('later interpretations never rewrite original report text',()=>{
 const before=projectWorld(bundle,layout,1).dreams.find(d=>d.title==='Blue stairs');
 const after=projectWorld(bundle,layout,5).dreams.find(d=>d.id===before.id);
 assert.equal(after.text,before.text);assert.equal(after.event,before.event);
});
